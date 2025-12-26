"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import React, { useState, useRef, useEffect } from "react"
import { LayoutDashboard, Mail, FileText, Settings, UserPlus, LogOut, Triangle,User, TriangleAlert } from "lucide-react" 
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
  userName?: string | null     
  userAvatar?: string | null
}

export function DashboardSidebar({ userEmail, userRole, userName, userAvatar }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  
  // --- STATE ---
  const [isLifting, setIsLifting] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [liftPx, setLiftPx] = useState(0)
  const [anchorShift, setAnchorShift] = useState(0)
  const [isReady, setIsReady] = useState(false) // Safety lock state

  // --- REFS ---
  const measuringRef = useRef<HTMLDivElement | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // --- CONSTANTS ---
  const LIFT_DURATION = 250 
  const DEFAULT_LIFT = 200 
  const GAP_OFFSET = 25 

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push("/")
  }

  const toggleMenu = (open: boolean) => {
    setIsMenuOpen(open)
    
    if (open) {
      // 1. Calculate height
      const contentHeight = measuringRef.current?.offsetHeight || DEFAULT_LIFT
      const totalLift = contentHeight + GAP_OFFSET

      // 2. Apply Lift
      setLiftPx(totalLift)
      setAnchorShift(totalLift)
      setIsLifting(true)

      // 3. Safety Lock: LOCK IMMEDIATELY
      setIsReady(false) 
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      // Unlock ONLY after the animation duration + buffer
      timeoutRef.current = setTimeout(() => {
        setIsReady(true)
      }, LIFT_DURATION + 50) 

    } else {
      // 4. Reset on close
      setIsLifting(false)
      setLiftPx(0)
      setAnchorShift(0)
      setIsReady(false)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }

  return (
    <aside className="w-64 rounded-xl m-2 border border-[#2E2F2F] bg-[#171717] flex flex-col h-[98%] relative overflow-hidden">
      <div className="p-4 gap-3 border-[#2E2F2F] flex ">
        <svg fill="currentColor" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="size-6 md:size-8 text-white"><path d="M50 10L80 80H65L50 50L35 80H20L50 10Z" fill="currentColor"></path><circle cx="50" cy="35" r="5" fill="currentColor"></circle></svg>
        <h1 className="text-2xl font-bold text-foreground"> CRM.tao</h1>
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
          
          {/* Invisible Anchor */}
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
              "z-50 ",
              "transition-all ease-in-out", 
              isMenuOpen ? "rounded-t-xl rounded-b-none border-b-[#171717]" : "rounded-xl"
            )}
            style={{ 
              transform: isLifting ? `translateY(-${liftPx}px)` : 'translateY(0)',
              transitionDuration: `${LIFT_DURATION}ms`
            }}
          >
            <Avatar className="h-9 w-9 rounded-xl">
               <AvatarImage 
                src={userAvatar || `https://avatar.vercel.sh/${userEmail}.png`} 
                alt={userEmail}
                className="object-cover" 
              />
                <AvatarFallback>{userEmail?.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="ml-1 text-left ">
              <div className="text-sm font-medium text-foreground truncate capitalize">
                {userName || userRole} 
              </div>
              <div className="text-xs text-muted-foreground truncate w-32">{userEmail}</div>
            </div>
           <Triangle className="fill-[#3d3d3d] size-3 text-[#3b3b3b]  rotate-180"/>
          </div>

          {/* Measurement Node */}
          <div ref={measuringRef} className="w-50 bg-transparent absolute opacity-0 pointer-events-none left-2 invisible">
             <div className="p-4"><div className="h-40"></div></div>
          </div>

          <DropdownMenuContent 
              className={cn(
                "w-59.5 bg-[#171717] border border-[#2E2F2F] shadow-none z-40 mb-3 rounded-b-xl rounded-t-none border-t-0 -mt-px",
                "overflow-hidden origin-top",
                "data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:slide-out-to-top-2",
                // Remove opacity-0, but allow pointer-events control
                "relative" 
              )}
              align="start"
              side="bottom"
              sideOffset={0} 
              avoidCollisions={false}
            >
            
            {/* 🛡️ THE SHIELD: A physical block over the buttons until ready */}
            {!isReady && (
                <div className="absolute inset-0 z-[100] bg-transparent cursor-default" />
            )}

            <div className={cn("transition-opacity duration-300", !isReady && "opacity-50")}>
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
                    { icon: TriangleAlert, label: "under-construction", delay: '150ms' , href: "/dashboard" , col:"text-yellow-300"}, 
                    { icon: TriangleAlert, label: "under-construction", delay: '250ms' , href: "/dashboard" , col:"text-yellow-300" }, 
                    {
                    icon: User, 
                    label: "Profile settings", 
                    delay: '150ms',
                    href: "/dashboard/profile" 
                    },
                ].map((item, idx) => (
                    <DropdownMenuItem 
                    key={idx}
                    className="cursor-pointer animate-in  slide-in-from-top-1 duration-300 fill-mode-forwards"
                    style={{ animationDelay: item.delay }}
                    asChild
                    >
                    <Link href={item.href }>
                        <item.icon  className= {`mr-2 ${item.col} h-4 w-4`}/>
                        <span>{item.label}</span>
                    </Link>
                    </DropdownMenuItem>
                ))}
                </div>

                <DropdownMenuSeparator className="my-2" />
                
                <DropdownMenuItem 
                onClick={handleSignOut}
                className={cn(
                    "cursor-pointer animate-in  slide-in-from-top-1 duration-300 fill-mode-forwards",
                    "focus:bg-red-500/10 focus:text-red-500 transition-colors group"
                )}
                style={{ animationDelay: '450ms' }}
                >
                <LogOut className="mr-2 h-4 w-4 transition-colors" /> 
                <span className="font-medium">Log out</span>
                </DropdownMenuItem>
                
                <div className="h-2"></div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <div className="h-16 w-full"></div>
      </div>
    </aside>
  )
}