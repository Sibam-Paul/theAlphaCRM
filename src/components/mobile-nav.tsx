"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { Menu, X, LayoutDashboard, Mail, FileText, Settings, UserPlus, LogOut, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/utils/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Email", href: "/dashboard/email", icon: Mail },
  { name: "Logs", href: "/dashboard/logs", icon: FileText },
  { name: "Settings", href: "#", icon: Settings, disabled: true },
]

interface MobileNavProps {
  userEmail: string
  userRole: string
  userName?: string | null
  userAvatar?: string | null
}

export function MobileNav({ userEmail, userRole, userName, userAvatar }: MobileNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push("/")
  }

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#171717] border-b border-[#2E2F2F] px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">CRM.tao</h1>
        
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] bg-[#171717] border-[#2E2F2F] p-0">
            <SheetHeader className="p-4 border-b border-[#2E2F2F]">
              <SheetTitle className="text-2xl font-bold text-foreground text-left">CRM.tao</SheetTitle>
            </SheetHeader>
            
            {/* User Profile Section */}
            <div className="p-4 border-b border-[#2E2F2F]">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 rounded-xl">
                  <AvatarImage 
                    src={userAvatar || `https://avatar.vercel.sh/${userEmail}.png`} 
                    alt={userEmail}
                    className="object-cover" 
                  />
                  <AvatarFallback>{userEmail?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate capitalize">
                    {userName || userRole}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{userEmail}</div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase mb-2 px-3">Menu</div>
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.disabled ? "#" : item.href}
                    onClick={() => !item.disabled && setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors",
                      isActive ? "bg-foreground/5 text-foreground" : "text-muted-foreground hover:bg-foreground/5",
                      item.disabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                )
              })}

              {userRole === 'admin' && (
                <>
                  <div className="my-6" />
                  <div className="text-xs font-semibold text-muted-foreground uppercase mb-2 px-3">Admin Actions</div>
                  <Link
                    href="/dashboard/users"
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors",
                      pathname === "/dashboard/users" ? "bg-foreground/5 text-foreground" : "text-muted-foreground hover:bg-foreground/5"
                    )}
                  >
                    <UserPlus className="w-5 h-5" />
                    User Management
                  </Link>
                </>
              )}

              {/* User Actions */}
              <div className="my-6" />
              <div className="text-xs font-semibold text-muted-foreground uppercase mb-2 px-3">Account</div>
              <Link
                href="/dashboard/profile"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors",
                  pathname === "/dashboard/profile" ? "bg-foreground/5 text-foreground" : "text-muted-foreground hover:bg-foreground/5"
                )}
              >
                <User className="w-5 h-5" />
                Profile Settings
              </Link>
              
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Log out
              </button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Spacer for fixed header on mobile */}
      <div className="md:hidden h-[72px]" />
    </>
  )
}
