"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useActionState } from "react"
import { sendEmail, type EmailState } from "@/app/action/send-email" 
import { Inbox,Star, Archive, Trash2, AlertCircle, Search, ChevronLeft, ChevronRight, Send, Loader2, X, User, Reply, Forward} from "lucide-react"
import DOMPurify from "isomorphic-dompurify";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { toast } from "sonner" 
import { Avatar, AvatarFallback } from "@/components/ui/avatar" // Make sure to have this component or remove if not needed
import { Separator } from "@/components/ui/separator"

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
  // --- UI STATE ---
  const [emailType, setEmailType] = useState<"broadcast" | "direct">("direct")
  const [selectedFolder, setSelectedFolder] = useState("inbox")
  const [selectedEmails, setSelectedEmails] = useState<number[]>([])
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // --- NEW FUNCTIONALITY STATE ---
  const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null)
  const [searchQuery, setSearchQuery] = useState("") 
  const detailViewRef = useRef<HTMLDivElement>(null)

  // --- SERVER ACTION STATE ---
  const [state, formAction, isPending] = useActionState(sendEmail, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  // 1. Toast & Reset Logic
  useEffect(() => {
    if (state.success) {
      toast.success("Email sent successfully!")
      formRef.current?.reset()
    } else if (state.error) {
      toast.error(state.error)
    }
  }, [state])

  // 2. Auto-Scroll Logic
  useEffect(() => {
    if (selectedEmail && detailViewRef.current) {
        setTimeout(() => {
            detailViewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
        }, 100)
    }
  }, [selectedEmail])

  // 3. Search Filtering Logic
  const filteredLogs = useMemo(() => {
    if (!searchQuery) return logs;
    const lowerQuery = searchQuery.toLowerCase();
    return logs.filter((email) => {
        const cleanBody = email.body.replace(/<[^>]*>?/gm, '').toLowerCase();
        return (
            email.subject.toLowerCase().includes(lowerQuery) ||
            email.recipients.toLowerCase().includes(lowerQuery) ||
            cleanBody.includes(lowerQuery)
        );
    });
  }, [logs, searchQuery]);



  const toggleEmailSelection = (id: number) => {
    setSelectedEmails((prev) => (prev.includes(id) ? prev.filter((emailId) => emailId !== id) : [...prev, id]))
  }

  return (
    <div className="p-8 h-full flex flex-col overflow-y-auto bg-[#0A0A0A] space-y-8">
      
      {/* --- SECTION 1: COMPOSER --- */}
      <Card className="border-[#2E2F2F] bg-[#171717]">
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
          <div className="flex gap-1 mb-6">
            <button
              type="button"
              onClick={() => setEmailType("broadcast")}
              className={cn(
                "py-3 px-4 rounded-lg text-sm font-medium transition-all border-[#2E2F2F]",
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
                "py-3 px-4 rounded-lg text-sm font-medium transition-all",
                emailType === "direct"
                  ? "bg-foreground/5 border-foreground/20 text-foreground"
                  : "bg-transparent border-border/50 text-muted-foreground hover:bg-foreground/5",
              )}
            >
              Direct
            </button>
          </div>

          <form ref={formRef} action={formAction} className="space-y-4 *:m-1 *:p-3">
             {/* FROM */}
             <div>
                <label className="text-sm font-medium text-foreground block mb-2">From</label>
                <div className="flex items-center gap-2">
                    
                    <div className="relative">                       
                        <input
                        name="fromPrefix" 
                        placeholder="noreply" 
                        defaultValue="noreply"
                        className="bg-transparent border border-[#373737] rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#575757] focus:border-[#575757]"
                      ></input>

                    </div>
                </div>
            </div>

            {/* TO */}
            <div className="gap-4 *:mb-4">
                <div>
                    <label className="text-sm font-medium text-foreground block mb-2">To</label>
                    
                    <input 
                        name="to" 
                        type="email" 
                        placeholder="client@example.com" 
                        className="bg-transparent  w-[40%] border border-[#373737] rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#575757] focus:border-[#575757]" 
                        required 
                    />
                </div>
            </div>
            {/* TITLE (Sender Name) */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Title (Sender Name)</label>
              <input 
                name="title" 
                placeholder="e.g. Support Team" 
                className="bg-transparent w-[40%] border border-[#373737] rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#575757] focus:border-[#575757]" 
                required 
              />
            </div>

            {/* SUBJECT */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Subject</label>
              <input name="subject" placeholder="Email subject" className="bg-transparent w-[40%] border border-[#373737] rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#575757] focus:border-[#575757]" required />
            </div>

            {/* MESSAGE */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Message</label>
              <Textarea name="message" placeholder="Enter message....." rows={6} className="bg-transparent border border-[#373737] rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#575757] focus:border-[#575757]" required />
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="relative left-3.75 w-[25%] h-10 bg-white text-black font-bold hover:bg-[#E5E5E5]"
              size="lg"
            >
              {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              {isPending ? "Sending..." : `Send ${emailType === "broadcast" ? "Broadcast" : "Direct"} Email`}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* --- SECTION 2: HISTORY LIST --- */}
      <Card className="border-[#2D2D2D] bg-[#171717]">
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
            

            <div className="flex-1 min-w-0">
              <div className="flex items-center mb-3 gap-2">
                <div className="relative flex-1 bg-[#171717] rounded-md mx-5">
                  <Search className="absolute left-3 top-1/2  -translate-y-1/2 w-4 h-4 text-muted-foregroun d" />
                  {/* //search bar  */}
                  <input 
                    placeholder="Search emails..." 
                    className="focus:ring-2 focus:ring-[#575757] pl-10 h-10  w-[95%] border border-[#373737] rounded-xl bg-black outline-none"
                    // CONNECTED SEARCH
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                   />
                </div>
              </div>

              <div className="space-y-px h-[50vh] overflow-y-auto scroll-auto">
                {filteredLogs.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground text-sm">
                        {searchQuery ? "No matching emails found." : "No emails sent yet."}
                    </div>
                ) : (
                    filteredLogs.map((email) => (
                    <div
                        key={email.id}
                        // CLICK EVENT ADDED HERE
                        onClick={() => setSelectedEmail(email)}
                        className={cn(
                            "flex items-center gap-3 p-3 m-2 hover:bg-foreground/5 rounded-lg cursor-pointer transition-colors group  hover:border-border/50",
                            selectedEmail?.id === email.id ? "bg-foreground/5 border-gray-700" : ""
                        )}
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
                            <span className="text-sm font-medium text-foreground truncate" title={email.recipients}>
                                To: {email.recipients.split('@')[0]}
                            </span>
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

      {/* --- SECTION 3: READ VIEW (Appears Below) --- */}
      {selectedEmail && (
        <div ref={detailViewRef} className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            <Card className="border-[#2D2D2D] shadow-lg overflow-hidden bg-[#171717]">
                {/* Header Controls */}
                <div className="flex items-center justify-between py-2 px-3 border-b border-[#2D2D2D]">
                    <h3 className="font-semibold text-lg truncate pr-4 text-foreground text-center">{selectedEmail.subject}</h3>
                    <div className="flex items-center gap-2">
                        <Button className="bg-[#222222] hover:bg-[#333333]" size="icon" onClick={() => setSelectedEmail(null)} title="Close">
                            <X className="w-4 h-4 text-[#848484] hover:text-[#F8F8F8] " />
                        </Button>
                    </div>
                </div>

                <CardContent className="p-6 md:p-8">
                    {/* Sender Info Row */}
                    <div className="flex items-start justify-between mb-8">
                        <div className="flex gap-4">
                            <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-primary/20 text-primary"><User className="w-5 h-5" /></AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm text-foreground">CRM.tao</span>
                                    <span className="text-xs text-muted-foreground">&lt;noreply@{process.env.NEXT_PUBLIC_MAILEROO_DOMAIN || 'domain.com'}&gt;</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    to <span className="text-foreground">{selectedEmail.recipients}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {selectedEmail.sentAt ? new Date(selectedEmail.sentAt).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }) : ''}
                        </div>
                    </div>

                    {/* Email Body Content */}
                    <div className="prose prose-sm max-w-none text-gray-300 dark:prose-invert">
                        {/* 2. Sanitize BEFORE rendering */}
                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedEmail.body) }} />
                    </div>

                    <Separator className="my-8 bg-[171717]" />

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Button className="gap-2 text-[#848484] border border-[#2D2D2D] hover:text-foreground hover:bg-[#222222] bg-[171717]">
                            <Reply className="w-4 h-4" />Reply
                        </Button>
                        <Button className="gap-2 text-[#848484] border border-[#2D2D2D] hover:text-foreground hover:bg-[#222222] bg-[171717]">
                            <Forward className="w-4 h-4" />Forward
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
      )}

    </div>
  )
}