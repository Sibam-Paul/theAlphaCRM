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

  if (!dbUser) {
      return (
        <div className="flex flex-col h-dvh w-full items-center justify-center bg-black text-white p-4">
          <div className="max-w-md text-center space-y-4 border border-[#2E2F2F] bg-[#171717] p-8 rounded-xl">
            <h1 className="text-xl font-bold text-red-500">Account Error</h1>
            <p className="text-muted-foreground text-sm">
              Your account is authenticated but missing from the database.
            </p>
            <form action={async () => {
              "use server"
              const sb = await createClient()
              await sb.auth.signOut()
              redirect('/')
            }}>
              <button className="bg-white text-black px-4 py-2 rounded-full font-bold hover:bg-gray-200">
                Sign Out
              </button>
            </form>
          </div>
        </div>
      )
    }  

  return (
    <div className="flex h-dvh bg-black overflow-hidden">
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