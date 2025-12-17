import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { db } from "@/db" 
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // 1. Auth Check: Get the logged-in user from Supabase
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/auth/login")
  }

  // 2. Role Check: Fetch the REAL role from your Database
  // We select only the 'role' field where the ID matches the logged-in user
  const dbResult = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, user.id))

  // If we found a user in the DB, use their role. Otherwise default to "user"
  const userRole = dbResult[0]?.role || "user"

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar 
        userEmail={user.email || ""} 
        userRole={userRole} 
      />

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}