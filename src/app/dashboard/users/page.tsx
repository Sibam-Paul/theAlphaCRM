import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

export default async function AdminUsersPage() {
  const supabase = await createClient()
  
  // 1. Verify Session
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // 2. SERVER-SIDE ROLE CHECK (The Critical Fix)
  // We fetch the role from the database, not the potentially stale session
  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    columns: { role: true }
  })

  // 3. Kick them out if not Admin
  if (dbUser?.role !== 'admin') {
    // You can redirect to dashboard or show a 403 Unauthorized page
    redirect("/dashboard") 
  }

  // --- Safe to render Admin content below ---
  return (
    <div className="p-6">
       <h1 className="text-2xl font-bold">User Management</h1>
       {/* Your user list components go here */}
    </div>
  )
}