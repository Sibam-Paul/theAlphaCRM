"use client"

import { useState, useEffect, useRef } from "react"
import { useActionState } from "react"
import { sendEmail, type EmailState } from "@/app/action/send-email" // Import your action
import {
  Inbox,
  Star,
  Archive,
  Trash2,
  AlertCircle,
  Search,
  RefreshCw,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Send,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { toast } from "sonner" 

// Define the shape of the log coming from DB
type EmailLog = {
    id: number
    recipients: string
    subject: string
    body: string
    status: string | null
    sentAt: Date | null
}

const initialState: EmailState = {
    success: false,
    message: "",
    error: ""
}

export default function EmailDashboard({ logs }: { logs: EmailLog[] }) {
  // --- STATE FOR UI ---
  const [emailType, setEmailType] = useState<"broadcast" | "direct">("direct") // Default to direct for now
  const [selectedFolder, setSelectedFolder] = useState("inbox")
  const [selectedEmails, setSelectedEmails] = useState<number[]>([])
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // --- STATE FOR FORM ACTION ---
  const [state, formAction, isPending] = useActionState(sendEmail, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  // Handle Success/Error Toasts
  useEffect(() => {
    if (state.success) {
      toast.success("Email sent successfully!")
      formRef.current?.reset()
    } else if (state.error) {
      toast.error(state.error)
    }
  }, [state])

  const folders = [
    { id: "inbox", name: "Sent", icon: Inbox }, // Renamed to Sent since this is a sender dashboard
    { id: "starred", name: "Starred", icon: Star },
    { id: "archive", name: "Archive", icon: Archive },
    { id: "spam", name: "Spam", icon: AlertCircle },
    { id: "trash", name: "Trash", icon: Trash2 },
  ]

  const toggleEmailSelection = (id: number) => {
    setSelectedEmails((prev) => (prev.includes(id) ? prev.filter((emailId) => emailId !== id) : [...prev, id]))
  }

  return (
    <div className="p-8 h-full flex flex-col overflow-y-auto bg-[#121212]">
      {/* Email Composer Section */}
      <Card className="mb-8 border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Send className="w-5 h-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-foreground">Email</CardTitle>
              <CardDescription>Send broadcast or direct emails to users</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Email Type Toggle */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => setEmailType("broadcast")}
              className={cn(
                "py-3 px-4 rounded-lg text-sm font-medium transition-all border",
                emailType === "broadcast"
                  ? "bg-foreground/5 border-foreground/20 text-foreground"
                  : "bg-transparent border-border/50 text-muted-foreground hover:bg-foreground/5",
              )}
            >
              Broadcast
            </button>
            <button
              type="button"
              onClick={() => setEmailType("direct")}
              className={cn(
                "py-3 px-4 rounded-lg text-sm font-medium transition-all border",
                emailType === "direct"
                  ? "bg-foreground/5 border-foreground/20 text-foreground"
                  : "bg-transparent border-border/50 text-muted-foreground hover:bg-foreground/5",
              )}
            >
              Direct
            </button>
          </div>

          {/* Email Form - Connected to Server Action */}
          <form ref={formRef} action={formAction} className="space-y-4 *:m-1 *:p-3">
            
            <div className="gap-4 *:mb-4">
                

                {/* TO INPUT (Added to match logic) */}
                <div>
                    <label className="text-sm font-medium text-foreground block mb-2">To</label>
                    <Input 
                        name="to" 
                        type="email" 
                        placeholder="client@example.com" 
                        className="bg-background  border-gray-700" 
                        required 
                    />
                </div>
            </div>

            {/* FROM INPUT (Added to match logic) */}
                <div>
                    <label className="text-sm font-medium text-foreground block mb-2">From</label>
                    <div className="flex items-center gap-2">
                        <Input 
                            name="fromPrefix" 
                            placeholder="noreply" 
                            defaultValue="noreply"
                            className="bg-background border-gray-700 hover:bg-[#1A1A1A]" 
                            required
                        />
                         
                    </div>
                </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Subject</label>
              <Input name="subject" placeholder="Email subject" className="bg-background border-gray-700" required />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Message</label>
              <Textarea name="message" placeholder="Enter message....." rows={6} className="bg-background resize-none  border-gray-700" required />
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-foreground/10 hover:bg-foreground/20 text-foreground  border-gray-700"
              size="lg"
            >
              {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              {isPending ? "Sending..." : `Send ${emailType === "broadcast" ? "Broadcast" : "Direct"} Email`}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Email History Section - Populated with Real DB Logs */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Inbox className="w-5 h-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-foreground">Email History</CardTitle>
              <CardDescription>View all sent emails</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6">
            <div className={cn("transition-all duration-300 ease-in-out", isSidebarCollapsed ? "w-0 overflow-hidden" : "w-48 shrink-0")}>
                <div className="space-y-1">
                  {folders.map((folder) => {
                    const Icon = folder.icon
                    return (
                      <button
                        key={folder.id}
                        onClick={() => setSelectedFolder(folder.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                          selectedFolder === folder.id
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {folder.name}
                      </button>
                    )
                  })}
                </div>
            </div>

            {/* Email List */}
            <div className="flex-1 min-w-0">
              {/* Search and Actions Bar */}
              <div className="flex items-center gap-2 mb-4 pb-4 border-white/5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 hover:bg-foreground/5 hover:text-foreground"
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                >
                  {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </Button>
                <div className="relative flex-1 border rounded-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search emails..." className="pl-9 bg-background border border-grey-700" />
                </div>
              </div>

              {/* Email Items (MAPPED FROM DB) */}
              <div className="space-y-px">
                {logs.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground text-sm">No emails sent yet.</div>
                ) : (
                    logs.map((email) => (
                    <div
                        key={email.id}
                        className="flex items-center gap-4 p-3 hover:bg-foreground/5 rounded-lg cursor-pointer transition-colors group border border-transparent hover:border-border/50"
                        onClick={() => toggleEmailSelection(email.id)}
                    >
                        <input
                        type="checkbox"
                        checked={selectedEmails.includes(email.id)}
                        onChange={() => toggleEmailSelection(email.id)}
                        className="w-4 h-4 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                        />
                        <button
                        onClick={(e) => {
                            e.stopPropagation()
                        }}
                        className="shrink-0"
                        >
                        <Star className="w-4 h-4 transition-colors text-muted-foreground/50 hover:text-muted-foreground" />
                        </button>
                        
                        <div className="flex-1 min-w-0 grid grid-cols-[150px_1fr_100px] gap-4 items-center">
                        {/* 1. Recipient Name */}
                        <span className="text-sm font-medium text-foreground truncate" title={email.recipients}>
                            To: {email.recipients.split('@')[0]}
                        </span>
                        
                        {/* 2. Subject & Preview */}
                        <div className="min-w-0">
                            <div className="flex gap-2">
                            <span className="text-sm font-medium text-foreground truncate">{email.subject}</span>
                            <span className="text-sm text-muted-foreground truncate">
                                - {email.body.replace(/<[^>]*>?/gm, '').substring(0, 50)}...
                            </span>
                            </div>
                        </div>

                            <span className="text-xs text-muted-foreground text-right">
                                {email.sentAt ? new Date(email.sentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}     
                            </span>
                        </div>
                    </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}