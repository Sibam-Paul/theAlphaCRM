import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { AddUserForm } from "@/components/add-user-form"
import { UserList } from "@/components/user-list"
import { fetchUsers } from "@/app/action/profile-actions"
// import {adduser } from lucide-react


export default async function AdminUsersPage() {
  const supabase = await createClient()
  
  // 1. Verify Session
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  
  const [dbUser, usersData] = await Promise.all([
    db.query.users.findFirst({
        where: eq(users.id, user.id),
        columns: { role: true }
    }),
    fetchUsers(0, "", user.id)
  ])

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
        
        <div className=" flex flex-col">
          {initialUsers.length > 0 ? (
             <UserList initialUsers={initialUsers} currentUserId={user.id} />
          ) : (
             <div className="flex flex-col items-center justify-center h-64 border border-dashed border-[#2E2F2F] rounded-xl bg-[#171717]/50 text-muted-foreground">
                <p>No other users found.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  )
}