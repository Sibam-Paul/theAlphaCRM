"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import React, { useState, useRef } from "react"
import { LayoutDashboard, Mail, FileText, Settings, UserPlus, LogOut, User, CreditCard, Bell } from "lucide-react" 
import { cn } from "@/lib/utils"
import { createClient } from "@/utils/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
  
  const [isLifting, setIsLifting] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [liftPx, setLiftPx] = useState(0)
  const [anchorShift, setAnchorShift] = useState(0)
  const measuringRef = useRef<HTMLDivElement | null>(null)
   
  const LIFT_DURATION = 500 
  const DEFAULT_LIFT = 200 
  const GAP_OFFSET = 25 

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push("/")
  }

  // Unified Toggle Function to prevent sync issues
  const toggleMenu = (open: boolean) => {
    if (open) {
      // OPENING: Measure and Lift
      const measured = (measuringRef.current?.offsetHeight ?? DEFAULT_LIFT) + GAP_OFFSET
      setLiftPx(measured)
      setAnchorShift(measured) 
      setIsLifting(true)
      setIsMenuOpen(true) 
    } else {
      // CLOSING (The Fix): 
      // 1. Drop the button and anchor IMMEDIATELY
      setIsLifting(false) 
      setLiftPx(0)
      setAnchorShift(0)

      // 2. Keep the menu OPEN while the button drops (for 500ms)
      // This ensures the menu slides down visually with the button
      setTimeout(() => {
        setIsMenuOpen(false)
      }, 150)
    }
  }

  return (
    <aside className="w-64 rounded-xl m-2 border border-[#2E2F2F] bg-[#171717] flex flex-col h-[98%] relative overflow-hidden">
      <div className="p-4 border-b border-[#2E2F2F]">
        <h1 className="text-2xl font-bold text-foreground">CRM.tao</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="text-xs font-semibold text-muted-foreground uppercase mb-2 px-3">Menu</div>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.disabled ? "#" : item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive ? "bg-foreground/5 text-foreground" : "text-muted-foreground hover:bg-foreground/5 ",
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

      <div className="p-2 absolute bottom-0 left-0 w-full">
        <DropdownMenu open={isMenuOpen} onOpenChange={toggleMenu}>
          {/* Invisible Anchor - Moves in sync with button */}
          <DropdownMenuTrigger asChild>
            <span
              className="absolute bottom-2 left-2 right-2 h-14 opacity-0 pointer-events-auto cursor-pointer"
              style={{ 
                transform: anchorShift ? `translateY(-${anchorShift}px)` : 'translateY(0)', 
                transition: `transform ${LIFT_DURATION}ms cubic-bezier(0.32,0.72,0,1)` 
              }}
            />
          </DropdownMenuTrigger>

          {/* VISUAL BUTTON */}
          <div
            className={cn(
              "absolute bottom-2 left-2 right-2 h-14 bg-[#171717] border border-[#2E2F2F] flex items-center px-3 gap-3 pointer-events-none select-none",
              "z-50",
              "transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
              isMenuOpen ? "rounded-t-xl rounded-b-none border-b-[#171717]" : "rounded-xl"
            )}
            style={{ transform: isLifting ? `translateY(-${liftPx}px)` : 'translateY(0)' }}
          >
            <Avatar className="h-9 w-9 rounded-xl">
              <AvatarImage src={`https://avatar.vercel.sh/${userEmail}.png`} alt={userEmail} />
              <AvatarFallback>{userEmail?.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="ml-1 text-left ">
              <div className="text-sm font-medium text-foreground truncate capitalize">{userRole}</div>
              <div className="text-xs text-muted-foreground truncate w-32">{userEmail}</div>
            </div>
          </div>

          {/* PRE-MEASUREMENT NODE (Keep this exactly as is) */}
          <div ref={measuringRef} className="w-58 bg-transparent absolute opacity-0 pointer-events-none left-2 invisible">
             <div className="p-4"><div className="h-40"></div></div>
          </div>

          {/* ACTUAL MENU CONTENT */}
          <DropdownMenuContent 
            className={cn(
              
                "w-60 bg-[#171717] border border-[#2E2F2F] shadow-none z-40 mb-3 rounded-b-xl rounded-t-none border-t-0 -mt-px",
                  "overflow-hidden origin-top"
                )}
                align="start"
            side="bottom"
            sideOffset={0} 
            avoidCollisions={false}
          >
            {/* NO 'hidden' checks here - let the mounting handle it */}
            <div className="animate-in fade-in slide-in-from-top-2 duration-300 fill-mode-forwards">
              <DropdownMenuLabel className="font-normal mb-1">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm text-white font-medium leading-none capitalize">My Account</p>
                  <p className="text-xs leading-none text-muted-foreground">Manage your settings</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
            </div>

            <div className="space-y-1">
              {[
                { icon: User, label: "Profile", delay: '150ms' }, 
                { icon: CreditCard, label: "Billing", delay: '250ms' }, 
                { icon: Bell, label: "Notifications", delay: '350ms' },
              ].map((item, idx) => (
                <DropdownMenuItem 
                  key={idx}
                  className="cursor-pointer animate-in fade-in slide-in-from-top-1 duration-300 fill-mode-forwards"
                  style={{ animationDelay: item.delay }}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.label}</span>
                </DropdownMenuItem>
              ))}
            </div>

            <DropdownMenuSeparator className="my-2" />
            
            <DropdownMenuItem 
              onClick={handleSignOut}
              className={cn(
                "cursor-pointer animate-in fade-in slide-in-from-top-1 duration-300 fill-mode-forwards",
                // Removes default background bar and sets hover colors
                "focus:bg-red-500/10 focus:text-red-500 transition-colors group"
              )}
              style={{ animationDelay: '450ms' }}
            >
              {/* Remove 'text-white' from LogOut icon so it inherits the focus:text-red-500 */}
              <LogOut className="mr-2 h-4 w-4 transition-colors" /> 
              <span className="font-medium">Log out</span>
            </DropdownMenuItem>
            
            <div className="h-2"></div>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <div className="h-16 w-full"></div>
      </div>
    </aside>
  )
}