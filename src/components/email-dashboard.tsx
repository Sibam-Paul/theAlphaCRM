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
import {Bold , Italic , Paperclip} from "lucide-react" 


// Define the shape of the log coming from DB
type EmailLog = {
    id: number
    recipients: string
    subject: string
    body: string
    status: string | null
    sentAt: Date | null
    sender_name: string | null
    prefix : string | null
}

const initialState: EmailState = {
    success: false,
    message: "",
    error: ""
}

export default function EmailDashboard({ logs }: { logs: EmailLog[] }) {
  // --- UI STATE ---
  const [emailType, setEmailType] = useState<"broadcast" | "direct">("direct")
  const [selectedEmails, setSelectedEmails] = useState<number[]>([])
  

  // --- NEW FUNCTIONALITY STATE ---
  const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null)
  const [searchQuery, setSearchQuery] = useState("") 
  const [isDetailView, setIsDetailView] = useState(false) // Mobile stack navigation state
  const detailViewRef = useRef<HTMLDivElement>(null)

  // --- SERVER ACTION STATE ---
  const [state, formAction, isPending] = useActionState(sendEmail, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  // 1. Toast & Reset Logic
  useEffect(() => {
  if (state.success) {
    // ✅ RICH SUCCESS TOAST
    toast.success("Email Sent Successfully", {
      description: "Your message has been queued for delivery.",
      duration: 4000, // 4 seconds
    })
    formRef.current?.reset()
  } else if (state.error) {
   
    toast.error("Delivery Failed", {
      description: state.error,
    })
  }
}, [state])


  // 2. Auto-Scroll Logic (Updated for mobile view swap)
  useEffect(() => {
    if (selectedEmail) {
        // On mobile, scroll to top when entering detail view
        if (window.innerWidth < 768) {
            window.scrollTo({ top: 0, behavior: "smooth" })
        } else if (detailViewRef.current) {
            // On desktop, scroll to the detail section
            setTimeout(() => {
                detailViewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
            }, 100)
        }
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
            cleanBody.includes(lowerQuery) ||
            (email.sender_name && email.sender_name.toLowerCase().includes(lowerQuery))
        );
    });
  }, [logs, searchQuery]);



  const toggleEmailSelection = (id: number) => {
    setSelectedEmails((prev) => (prev.includes(id) ? prev.filter((emailId) => emailId !== id) : [...prev, id]))
  }

  // Handle email selection with mobile view swap
  const handleEmailClick = (email: EmailLog) => {
    setSelectedEmail(email)
    setIsDetailView(true)
  }

  // Handle back to list on mobile
  const handleBackToList = () => {
    setIsDetailView(false)
    setSelectedEmail(null)
  }

  return (
    <div className="p-4 md:p-4 pt-20 md:pt-2.5 h-full flex flex-col overflow-y-auto bg-[#0A0A0A] space-y-4 md:space-y-8">
      
      {/* --- MOBILE: Detail View (Full Screen Reading Pane) --- */}
      {isDetailView && selectedEmail && (
        <div className="block md:hidden fixed inset-0 z-50 bg-[#0A0A0A] overflow-y-auto flex items-start justify-center pt-4 pb-4">
          <Card className="border-[#2D2D2D] shadow-lg overflow-hidden bg-[#171717] w-full max-w-2xl mx-4 my-auto">
            {/* Back Button Header */}
            <div className="flex items-center gap-3 py-3 px-4 border-b border-[#2D2D2D] bg-[#1a1a1a] sticky top-0 z-10">
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={handleBackToList}
                className="h-11 w-11"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h3 className="font-semibold text-base truncate flex-1 text-foreground">{selectedEmail.subject}</h3>
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={handleBackToList} 
                className="h-11 w-11"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <CardContent className="p-4">
              {/* Sender Info Row */}
              <div className="flex items-start gap-3 mb-6">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-primary/20 text-primary">
                    <User className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-base text-foreground truncate">
                      {selectedEmail.sender_name || "System Notification"}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      &lt;{selectedEmail.prefix}@{process.env.NEXT_PUBLIC_MAILEROO_DOMAIN }&gt;
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    to <span className="text-foreground truncate">{selectedEmail.recipients}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedEmail.sentAt ? new Date(selectedEmail.sentAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : ''}
                  </div>
                </div>
              </div>

              {/* Email Body Content */}
              <div className="prose prose-sm max-w-none text-gray-300 dark:prose-invert mb-6">
                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedEmail.body) }} />
              </div>

              <Separator className="my-6 bg-[#2D2D2D]" />

              {/* Action Buttons - Horizontal Layout */}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 h-12 gap-2 text-[#848484] border-[#2D2D2D] hover:text-foreground hover:bg-[#222222] bg-transparent">
                  <Reply className="w-4 h-4" />Reply
                </Button>
                <Button variant="outline" className="flex-1 h-12 gap-2 text-[#848484] border-[#2D2D2D] hover:text-foreground hover:bg-[#222222] bg-transparent">
                  <Forward className="w-4 h-4" />Forward
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* --- SECTION 1: COMPOSER (Hidden on mobile detail view) --- */}
          {/* --- SECTION 1: COMPOSER --- */}
<div className={cn(
  "flex flex-col bg-[#0A0A0A] rounded-xl border border-[#2E2F2F] overflow-hidden shrink-0",
  // Responsive Height Logic:
  // Mobile: 
  //   - Hidden if reading an email (isDetailView)
  //   - visible: h-[40vh] (TAKES 40% OF SCREEN)
  // Desktop: 
  //   - h-auto / min-h-[500px]
  isDetailView ? "hidden md:flex md:h-[500px]" : "flex h-[45vh] md:h-auto md:min-h-[500px]"
)}>
    {/* 1. Control Bar */}
    <div className="h-14 border-b border-[#2E2F2F] flex items-center justify-between px-4 bg-[#111111] shrink-0">
        <div className="flex bg-[#1A1A1A] rounded-lg p-1 border border-[#2E2F2F]">
            <button
                type="button"
                onClick={() => setEmailType("direct")}
                className={cn(
                    "px-3 py-1 text-sm font-medium rounded-md transition-all",
                    emailType === "direct" ? "bg-[#2E2F2F] text-white shadow-sm" : "text-muted-foreground hover:text-white"
                )}
            >
                Direct
            </button>
            <button
                type="button"
                onClick={() => setEmailType("broadcast")}
                className={cn(
                    "px-3 py-1 text-sm font-medium rounded-md transition-all",
                    emailType === "broadcast" ? "bg-[#2E2F2F] text-white shadow-sm" : "text-muted-foreground hover:text-white"
                )}
            >
                Broadcast
            </button>
        </div>
        <div className="text-[10px] tracking-widest text-muted-foreground font-mono uppercase  xs:block">
            New Message
        </div>
    </div>

    {/* 2. Form Area */}
    <form ref={formRef} action={formAction} className="flex-1 flex flex-col min-h-0">
        
        {/* Compact Header Inputs */}
        <div className="px-4 md:px-6 py-2 space-y-1 border-b border-[#2E2F2F] bg-[#0A0A0A]">
            
            {/* ROW 1: FROM (Sender Name + Email) - WRAPS on Mobile */}
            <div className="flex flex-col md:flex-row md:items-center py-2 border-b border-[#1F1F1F] gap-2 md:gap-0">
                <span className="text-sm font-semibold text-muted-foreground w-16 shrink-0 pt-2 md:pt-0">From:</span>
                
                <div className="flex flex-wrap items-center gap-1 w-full">
                    {/* Input 1: Sender Name */}
                    <input 
                        name="title" 
                        defaultValue="TheAlphaOnes" 
                        placeholder="Sender Name"
                        className="bg-transparent text-sm text-foreground focus:outline-none min-w-[120px] placeholder:text-muted-foreground/50"
                    />
                    
                    {/* Visual brackets for the email */}
                    <span className="text-muted-foreground hidden md:inline">&lt;</span>
                    
                    {/* Input 2: Email Prefix */}
                    <div className="flex items-center bg-[#151515] md:bg-transparent rounded px-2 md:px-0 py-1 md:py-0 border border-[#2E2F2F] md:border-none">
                        <input 
                            name="fromPrefix" 
                            defaultValue="noreply" 
                            placeholder="noreply"
                            className="bg-transparent border rounded-xl pl-1 border-[#444444] text-sm  focus:text-foreground focus:outline-none w-20 "
                        />
                      <span className="text-muted-foreground text-sm">@{process.env.NEXT_PUBLIC_MAILEROO_DOMAIN}</span>
                    </div>
                    
                    <span className="text-muted-foreground hidden md:inline">&gt;</span>
                </div>
            </div>

            {/* ROW 2: TO */}
            <div className="flex items-center py-2 border-b border-[#1F1F1F]">
                <span className="text-sm font-semibold text-muted-foreground w-16 shrink-0">To:</span>
                {/* Input 3: Recipient */}
                <input 
                    name="to" 
                    type="email" 
                    placeholder="recipient@example.com" 
                    required
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-muted-foreground/50 focus:outline-none min-w-0" 
                />
            </div>

            {/* ROW 3: SUBJECT */}
            <div className="flex items-center py-2">
                  <span className="text-sm font-semibold text-muted-foreground w-16 shrink-0">Subject:</span>
                  {/* Input 4: Subject */}
                  <input 
                    name="subject" 
                    placeholder="What is this about?" 
                    required
                    className="flex-1 bg-transparent text-sm md:text-base font-medium text-white placeholder:text-muted-foreground/50 focus:outline-none min-w-0" 
                />
            </div>
        </div>

        {/* 3. Editor Area (Input 5: Message) */}
        <div className="flex-1 p-4 md:p-6  bg-[#0A0A0A] overflow-hidden">
            <Textarea
                name="message"
                placeholder="Write your message here..."
                className="w-full h-full bg-transparent resize-none border-none focus-visible:ring-0 text-sm md:text-base leading-relaxed text-gray-300 placeholder:text-muted-foreground/30 p-0"
                required
            />
        </div>

        {/* 4. Footer Toolbar */}
        <div className="h-14 md:h-16 border-t border-[#2E2F2F] bg-[#111111] px-4 md:px-6 flex items-center justify-between shrink-0">
            {/* Fake Formatting Tools */}
            <div className="flex items-center gap-1 text-muted-foreground">
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 hover:text-white"><Bold className="w-4 h-4" /></Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 hover:text-white"><Italic className="w-4 h-4" /></Button>
                <div className="w-px h-4 bg-[#333] mx-2 hidden md:block" />
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 hover:text-white"><Paperclip className="w-4 h-4" /></Button>
            </div>

            {/* Send Button */}
            <Button 
                type="submit" 
                disabled={isPending}
                className="bg-white text-black hover:bg-gray-200 font-bold px-4 md:px-6 h-9 rounded-full transition-all active:scale-95 text-sm md:text-sm"
            >
                {isPending ? "Sending..." : "Send"} <Send className="w-2 h-3" />
            </Button>
        </div>
    </form>
</div>

      {/* --- SECTION 2: HISTORY LIST (Hidden on mobile detail view) --- */}
      <Card className={cn(
        "border-[#2D2D2D] bg-[#171717]",
        isDetailView && "hidden md:block"
      )}>
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
                <div className="relative flex-1 bg-[#171717] rounded-md mx-0 md:mx-5">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  {/* Search bar  */}
                  <input 
                    placeholder="Search emails..." 
                    className="focus:ring-2 focus:ring-[#575757] pl-10 h-11 md:h-10 w-full border border-[#373737] rounded-xl bg-black outline-none text-base md:text-sm"
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
                        onClick={() => handleEmailClick(email)}
                        className={cn(
                            "flex items-center gap-3 p-3 m-2 hover:bg-foreground/5 rounded-lg cursor-pointer transition-colors group hover:border-border/50 min-h-[44px]",
                            selectedEmail?.id === email.id ? "bg-foreground/5 border-gray-700" : ""
                        )}
                    >
                        <input
                        type="checkbox"
                        checked={selectedEmails.includes(email.id)}
                        onChange={() => toggleEmailSelection(email.id)}
                        className="w-5 h-5 cursor-pointer hidden md:block"
                        onClick={(e) => e.stopPropagation()}
                        />
                        <button
                        onClick={(e) => {
                            e.stopPropagation()
                        }}
                        className="shrink-0 hidden md:block"
                        >
                        <Star className="w-4 h-4 transition-colors text-muted-foreground/50 hover:text-muted-foreground" />
                        </button>
                        
                        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-[150px_1fr_100px] gap-2 md:gap-4 items-center">
                            <span className="text-sm md:text-sm font-medium text-foreground truncate" title={email.recipients}>
                                To: {email.recipients.split('@')[0]}
                            </span>
                            <div className="min-w-0">
                                <div className="flex gap-2">
                                <span className="text-sm md:text-sm font-medium text-foreground truncate">{email.subject}</span>
                                <span className="text-sm md:text-sm text-muted-foreground truncate hidden md:inline">
                                    - {email.body.replace(/<[^>]*>?/gm, '').substring(0, 50)}...
                                </span>
                                </div>
                            </div>
                            <span className="text-xs text-muted-foreground text-left md:text-right">
                                {email.sentAt ? new Date(email.sentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}     
                            </span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground block md:hidden" />
                    </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --- SECTION 3: READ VIEW (Desktop Only - Appears Below) --- */}
      {selectedEmail && (
        <div ref={detailViewRef} className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 hidden md:block">
            <Card className="border-[#2D2D2D] shadow-lg overflow-hidden bg-[#171717]">
                {/* Header Controls */}
                <div className="flex items-center justify-between py-2 px-3 border-b border-[#2D2D2D]">
                    <h3 className="font-semibold text-lg truncate pr-4 text-foreground text-center">{selectedEmail.subject}</h3>
                    <div className="flex items-center gap-2">
                        <Button className="bg-[#222222] hover:bg-[#333333]" size="icon" onClick={() => setSelectedEmail(null)} title="Close">
                            <X className="w-4 h-4 text-[#848484] hover:text-[#F8F8F8]" />
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
                                    <span className="font-bold text-lg text-foreground">
                                      {selectedEmail.sender_name || "System Notification"}
                                    </span>
                                    <span className="text-xs text-muted-foreground">&lt;{selectedEmail.prefix}@{process.env.NEXT_PUBLIC_MAILEROO_DOMAIN }&gt;</span>
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
                    <div className="prose prose-sm text-lg max-w-none text-gray-300 dark:prose-invert">
                        
                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedEmail.body) }} />
                    </div>

                    <Separator className="my-8 bg-[#2D2D2D]" />

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Button variant="outline" className="gap-2 text-[#848484] border-[#2D2D2D] hover:text-foreground hover:bg-[#222222] bg-transparent">
                            <Reply className="w-4 h-4" />Reply
                        </Button>
                        <Button variant="outline" className="gap-2 text-[#848484] border-[#2D2D2D] hover:text-foreground hover:bg-[#222222] bg-transparent">
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