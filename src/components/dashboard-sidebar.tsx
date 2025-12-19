"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Mail, FileText, Settings, UserPlus, LogOut, User, CreditCard, Bell, EllipsisVertical } from "lucide-react" 
import { cn } from "@/lib/utils"
import { createClient } from "@/utils/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
// REMOVE: import { AddUserDialog } from "@/components/add-user-dialog"

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
    <aside className="w-64 rounded-xl m-2 border border-[#2E2F2F] bg-[#171717] flex flex-col h-[98%]">
      <div className="p-4 border-b border-[#2E2F2F]">
        <h1 className="text-2xl font-bold  text-foreground">CRM.tao</h1>
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
                isActive ? "bg-foreground/5 text-foreground" : "text-muted-foreground hover:bg-foreground/5 text-foreground",
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
            <div className="my-6" />
            <div className="text-xs font-semibold text-muted-foreground uppercase mb-2 px-3">Admin Actions</div>
            
            {/* NEW: Link to the separate page instead of Dialog */}
            <Link
              href="/dashboard/users"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                pathname === "/dashboard/users" ? "bg-foreground/5 text-foreground" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
              )}
            >
              <UserPlus className="w-5 h-5" />
              User Management
            </Link>
          </>
        )}

      </nav>

      <div className="p-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="drelative h-12 w-full justify-start px-3 py-2 bg-[#171717] hover:bg-[#262626]">
              <Avatar className="h-9 w-9 rounded-xl">
                <AvatarImage src={`https://avatar.vercel.sh/${userEmail}.png`} alt={userEmail} />
                <AvatarFallback>{userEmail?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="ml-3 text-left">
                <div className="text-sm font-medium text-foreground truncate capitalize">{userRole}</div>
                <div className="text-xs text-muted-foreground truncate">{userEmail}</div>
              </div>
              <EllipsisVertical size={18} className="ms-10" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none capitalize">{userRole}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userEmail}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Account</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Billing</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}