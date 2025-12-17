import { db } from "@/db"
import { emailLogs } from "@/db/schema"
import { desc } from "drizzle-orm"
import EmailDashboard from "@/components/email-dashboard"

export default async function EmailPage() {
  // Fetch logs on the server
  const logs = await db
    .select()
    .from(emailLogs)
    .orderBy(desc(emailLogs.sentAt))
    .limit(100)

  return <EmailDashboard logs={logs} />
}