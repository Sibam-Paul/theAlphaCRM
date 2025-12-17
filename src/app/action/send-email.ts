'use server'

import { db } from "@/db"
import { emailLogs } from "@/db/schema"
import { revalidatePath } from "next/cache"

// 1. Define the Shape explicitly
export type EmailState = {
  success: boolean
  message: string
  error: string
}

// 2. Use the type in the function signature
export async function sendEmail(prevState: EmailState, formData: FormData): Promise<EmailState> {
  const fromPrefix = formData.get("fromPrefix") as string
  const to = formData.get("to") as string
  const subject = formData.get("subject") as string
  const message = formData.get("message") as string

  // Environment check (prevents crashes if env is missing)
  if (!process.env.MAILEROO_DOMAIN || !process.env.MAILEROO_API_KEY) {
     return { success: false, error: "Server configuration missing (Env)", message: "" }
  }

  const fromAddress = `${fromPrefix}@${process.env.MAILEROO_DOMAIN}`

  try {
    const response = await fetch('https://smtp.maileroo.com/api/v2/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': process.env.MAILEROO_API_KEY,
      },
      body: JSON.stringify({
        from: { address: fromAddress, display_name: `${fromPrefix}` },
        to: [{ address: to, display_name: "Recipient" }],
        subject: subject,
        html: message,
        plain: message.replace(/<[^>]*>?/gm, '')
      })
    })

    const data = await response.json()

    if (!data.success) {
      // ✅ ALWAYS return 'message' (even if empty)
      return { success: false, error: data.message || "Failed to send", message: "" }
    }

    await db.insert(emailLogs).values({
      recipients: to,
      subject: subject,
      body: message,
      type: 'direct',
      status: 'sent',
      sentAt: new Date(),
    })

    revalidatePath('/dashboard/email')
    
    // ✅ ALWAYS return 'error' (even if empty)
    return { success: true, message: "Email sent successfully!", error: "" }

  } catch (error: any) {
    console.error("❌ Server Error:", error)
    return { success: false, error: "Internal Server Error", message: "" }
  }
}