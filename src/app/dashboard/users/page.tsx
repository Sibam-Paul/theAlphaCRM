import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { AddUserForm } from "@/components/add-user-form"
import { UserList } from "@/components/user-list"
import { fetchUsers } from "@/app/action/profile-actions"

export default async function AdminUsersPage() {
  const supabase = await createClient()
  
  // 1. Verify Session
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  
  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    columns: { role: true }
  })

  if (dbUser?.role !== 'admin') redirect("/dashboard")


  const { data: initialUsers } = await fetchUsers(0, "", user.id)

  return (
    <div className="p-4 md:p-8 pt-20 md:pt-8 h-screen flex flex-col">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">User Management</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">Control access and manage team credentials.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 min-h-0">
        <div className="space-y-6">
         
             <AddUserForm />
          
        </div>
        
        <div className="min-h-0">
          {/* Pass the data fetched via the action */}
          <UserList initialUsers={initialUsers} currentUserId={user.id} />
        </div>
      </div>
    </div>
  )
}