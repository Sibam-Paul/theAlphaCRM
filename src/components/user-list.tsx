"use client"

import { useState, useEffect, useCallback } from "react"
import { useInView } from "react-intersection-observer" // Required for infinite scroll
import { fetchUsers } from "@/app/action/profile-actions"
import { Search, User, Trash2, ChevronDown, ChevronUp, Loader2, Phone, Shield, Fingerprint, Calendar, AlertCircle, Eye, EyeOff, Lock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { deleteUser } from "@/app/action/delete-user"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface CRMUser {
  id: string
  email: string
  name: string | null
  mobileNumber: string
  role: string | null
  createdAt: Date | null
  avatarUrl: string | null
}

export function UserList({ initialUsers, currentUserId }: { initialUsers: CRMUser[], currentUserId: string }) {
  const [users, setUsers] = useState<CRMUser[]>(initialUsers)
  const [offset, setOffset] = useState(initialUsers.length)
  const [hasMore, setHasMore] = useState(true)
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null)

  // Infinite Scroll Ref
  const { ref, inView } = useInView()

  // Deletion States
  const [isDeleting, setIsDeleting] = useState(false)
  const [targetUser, setTargetUser] = useState<CRMUser | null>(null)
  const [adminPass, setAdminPass] = useState("")
  const [deleteError, setDeleteError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const loadMoreUsers = useCallback(async () => {
    if (isLoading || !hasMore) return
    setIsLoading(true)

    const result = await fetchUsers(offset, search, currentUserId)

    if (result.success) {
      setUsers((prev) => [...prev, ...result.data])
      setOffset((prev) => prev + result.data.length)
      setHasMore(result.hasMore)
    }
    setIsLoading(false)
  }, [offset, hasMore, search, isLoading, currentUserId])

  // Trigger load more when scrolling to bottom
  useEffect(() => {
    if (inView) {
      loadMoreUsers()
    }
  }, [inView, loadMoreUsers])

  // Search Debounce Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      // Don't fetch on initial render if search is empty (initialUsers handles it)
      // But do fetch if search changes
        setIsLoading(true)
        const result = await fetchUsers(0, search, currentUserId)
        
        if (result.success) {
          setUsers(result.data)
          setOffset(result.data.length)
          setHasMore(result.hasMore)
        }
        setIsLoading(false)
    }, 500)
    return () => clearTimeout(delayDebounceFn)
  }, [search, currentUserId])


  const handleDelete = async () => {
    if (!targetUser || !adminPass) return

    setIsDeleting(true)
    setDeleteError("")

    const formData = new FormData()
    formData.append("adminPassword", adminPass)
    formData.append("targetUserId", targetUser.id)

    const result = await deleteUser(formData)

    if (result.success) {
      toast.success("User Deleted", {
        description: "The account has been permanently removed from the database.",
      })

   
      setUsers((prev) => prev.filter((u) => u.id !== targetUser.id))
      
      setTargetUser(null)
      setAdminPass("")
    } else {
      toast.error("Deletion Failed", {
        description: result.error || "Could not delete user. Please try again.",
      })
      setDeleteError(result.error || "Failed to delete user")
    }
    setIsDeleting(false)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTargetUser(null)
      setAdminPass("")
      setDeleteError("")
      setShowPassword(false)
    }
  }

  return (
    <div className="flex flex-col h-[85%] bg-[#171717] border border-[#2E2F2F] rounded-xl ">
      <div className="p-4 border-b border-[#2E2F2F] space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Active Members</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search email or name..."
            className="pl-9 bg-black/20 border-[#2E2F2F]"
            value={search} // Fixed: was searchTerm
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
      </div>

      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-2 ">
          {/* Changed filteredUsers to users to support pagination */}
          {users.map((user) => {
            const isExpanded = expandedUserId === user.id
            return (
              <div key={user.id} className={cn(
                "group rounded-lg border transition-all duration-200",
                isExpanded ? "bg-[#222] border-[#444]" : "bg-transparent border-transparent hover:bg-white/5"
              )}>
                <button
                  onClick={() => setExpandedUserId(isExpanded ? null : user.id)}
                  className="w-full flex items-center gap-3 p-3 text-left"
                >
                  <Avatar className="h-10 w-10 border border-[#2E2F2F]">
                    <AvatarImage
                      src={user.avatarUrl || `https://avatar.vercel.sh/${user.email}.png`}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-foreground/5 text-muted-foreground">
                      <User className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{user.name || "Unnamed User"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4 opacity-50" />}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 space-y-4 relative animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-1 gap-3 text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Fingerprint className="w-3.5 h-3.5" /> <span className="font-mono">{user.id}</span>
                      </div>
                      <div className="flex items-center gap-2 text-foreground">
                        <Shield className="w-3.5 h-3.5 text-blue-500" /> <span className="capitalize">{user.role}</span>
                      </div>
                      <div className="flex items-center gap-2 text-foreground">
                        <Phone className="w-3.5 h-3.5 text-green-500" /> {user.mobileNumber}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" /> Created: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10 h-8 gap-2"
                        disabled={user.id === currentUserId}
                        onClick={() => setTargetUser(user)}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete User
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          
          {/* Infinite Scroll Trigger */}
          {hasMore && (
            <div ref={ref} className="flex justify-center p-4">
               {isLoading && <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Confirmation Modal */}
      <AlertDialog open={!!targetUser} onOpenChange={handleOpenChange}>
        <AlertDialogContent className="bg-[#171717] border-[#2E2F2F]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500">Security Confirmation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete <span className="text-foreground font-bold">{targetUser?.email}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4 space-y-4">
            {deleteError && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-900/50 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{deleteError}</AlertDescription>
              </Alert>
            )}

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm admin password"
                value={adminPass}
                onChange={(e) => {
                  setAdminPass(e.target.value)
                  setDeleteError("")
                }}
                className={cn(
                  "pl-10 pr-10 h-10 w-full border rounded-md bg-transparent outline-none text-sm transition-all",
                  deleteError
                    ? "border-red-500 focus:ring-2 focus:ring-red-500/50"
                    : "border-[#373737] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-foreground placeholder:text-muted-foreground"
                )}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-[#2E2F2F] hover:bg-[#2E2F2F] text-foreground">Cancel</AlertDialogCancel>
            <Button
              disabled={!adminPass || isDeleting}
              onClick={handleDelete}
              variant="destructive"
            >
              {isDeleting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Confirm Hard Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}