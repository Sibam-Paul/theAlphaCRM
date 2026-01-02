'use server'

import { db } from "@/db"
import { emailLogs } from "@/db/schema"
import { revalidatePath } from "next/cache"
import { createClient as createSupabaseServer } from "@/utils/supabase/server"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

export type EmailState = {
  success: boolean
  message: string
  error: string
}

// 2. Use the type in the function signature
export async function sendEmail(prevState: EmailState, formData: FormData): Promise<EmailState> {
  const fromPrefix = formData.get("fromPrefix") as string
  const to = formData.get("to") as string
  const title = formData.get("title") as string // <--- NEW FIELD
  const subject = formData.get("subject") as string
  const message = formData.get("message") as string
  
  
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { success: false, error: "Unauthorized", message: "" }

  const dbUser = await db.select({ role: users.role })
    .from(users)
    .where(eq(users.id, user.id))

    // giving users email access for now 
  // if (dbUser[0]?.role !== 'admin') {   
  //    return { success: false, error: "Unauthorized: Admins only.", message: "" }
  // }
  // Environment check
  if (!process.env.MAILEROO_DOMAIN || !process.env.MAILEROO_API_KEY) {
     return { success: false, error: "Server configuration missing (Env)", message: "" }
  }

  const fromAddress = `${fromPrefix}@${process.env.MAILEROO_DOMAIN}`
  // Use the custom Title if provided, otherwise fallback to the prefix
  const displayName = title || fromPrefix 

  console.log(`📨 Sending from ${displayName} <${fromAddress}> to ${to}...`)

  try {
    const response = await fetch('https://smtp.maileroo.com/api/v2/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': process.env.MAILEROO_API_KEY,
      },
      body: JSON.stringify({
        from: { 
            address: fromAddress, 
            display_name: displayName // title field 
        },
        to: [{ address: to, display_name: "Recipient" }],
        subject: subject,
        html: message,
        plain: message.replace(/<[^>]*>?/gm, '')
      })
    })

    const data = await response.json()

    if (!data.success) {
          console.log("failed to send the message");
      return { success: false, error: data.message || "Failed to send", message: "" }
      
    }

    await db.insert(emailLogs).values({
      recipients: to,
      subject: subject,
      body: message,
      type: 'direct',
      status: 'sent',
      sentAt: new Date(),
      sender_name: displayName,
      prefix: fromPrefix
    })

    revalidatePath('/dashboard/email')
    
    return { success: true, message: "Email sent successfully!", error: "" }

  } catch (error: any) {
    console.error("❌ Server Error:", error)
    return { success: false, error: "Internal Server Error", message: "" }
  }
}