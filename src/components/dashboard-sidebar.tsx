"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Mail, FileText, Settings, LogOut } from "lucide-react" // Removed 'Users' icon
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { AddUserDialog } from "@/components/add-user-dialog"

// Removed "Users" from this list because it's now a special button
const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Email", href: "/dashboard/email", icon: Mail },
  { name: "Logs", href: "/dashboard/logs", icon: FileText },
  { name: "Settings", href: "#", icon: Settings, disabled: true },
]

interface DashboardSidebarProps {
  userEmail: string
  userRole: string
}

export function DashboardSidebar({ userEmail, userRole }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push("/")
  }

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-foreground">CRM Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your business</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <div className="text-xs font-semibold text-muted-foreground uppercase mb-2 px-3">Menu</div>
        
        {/* Standard Links */}
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.disabled ? "#" : item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive ? "bg-foreground/5 text-foreground" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
                item.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          )
        })}

        {/* --- SPECIAL ADMIN SECTION --- */}
        {userRole === 'admin' && (
          <>
            <div className="my-4 border-t border-border/50" />
            <div className="text-xs font-semibold text-muted-foreground uppercase mb-2 px-3">Admin Actions</div>
            
            {/* The Modal Trigger is here */}
            <AddUserDialog />
          </>
        )}

      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center text-foreground font-semibold">
            {userEmail?.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate capitalize">{userRole}</p>
            <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
          </div>
        </div>
        
        <Button variant="outline" size="sm" className="w-full gap-2  cursor-pointer hover:text-red-300" onClick={handleSignOut}>
            <LogOut className="w-4 h-4" />
            Sign Out
        </Button>
      </div>
    </aside>
  )
}