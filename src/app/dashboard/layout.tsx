// src/app/dashboard/layout.tsx
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { db } from "@/db" 
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // 👇 FETCH name AND avatarUrl
  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    columns: { 
      role: true, 
      name: true,       
      avatarUrl: true  
    } 
  })

  if (!dbUser) redirect('/auth/login?error=account_not_found')
  

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      {/* Mobile Navigation  (WPA)*/} 
      <MobileNav 
        userEmail={user.email!} 
        userRole={dbUser.role || 'user'} 
        userName={dbUser.name}      
        userAvatar={dbUser.avatarUrl} 
      />

      {/* Sidebar: Hidden on mobile, visible on desktop */}
      <div className="hidden md:block">
        <DashboardSidebar 
            userEmail={user.email!} 
            userRole={dbUser.role || 'user'} 
            userName={dbUser.name}      
            userAvatar={dbUser.avatarUrl} 
        />
      </div>

      <main className="flex-1 overflow-auto w-full">
        {children}
      </main>
    </div>
  )
}