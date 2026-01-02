"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AvatarUpload } from "@/components/avatar-upload"
import { updateProfileInfo, changePassword } from "@/app/action/profile-actions"
import { toast } from "sonner"
import { Loader2, Lock, User, Save } from "lucide-react"
import { Eye, EyeOff } from "lucide-react"

interface ProfileViewProps {
  user: {
    id: string
    email: string
    name: string | null
    mobileNumber: string | null
    avatarUrl: string | null
    role: string | null
  }
}

export function ProfileView({ user }: ProfileViewProps) {
  const [infoPending, setInfoPending] = useState(false)
  const [passPending, setPassPending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  // Handler for Profile Info
  const handleInfoSubmit = async (formData: FormData) => {
    setInfoPending(true)
    const result = await updateProfileInfo(formData)
    setInfoPending(false)

    if (result.success) {
      toast.success("Profile Updated")
    } else {
      toast.error("Error", { description: result.error })
    }
  }

  // Handler for Password Change
  const handlePassSubmit = async (formData: FormData) => {
    setPassPending(true)
    const result = await changePassword(formData)
    setPassPending(false)

    if (result.success) {
      toast.success("Password Changed", { description: "Your password has been updated." })
      // Optional: Clear the password fields
      const form = document.getElementById("password-form") as HTMLFormElement
      form?.reset()
    } else {
      toast.error("Update Failed", { description: result.error })
    }
  }

  return (
    <div className="grid gap-8">
      
      {/* CARD 1: PERSONAL INFORMATION */}
      <Card className="bg-[#171717] border-[#2E2F2F]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" />
            Personal Information
          </CardTitle>
          <CardDescription>Update your photo and personal details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center sm:flex-row gap-6 pb-6 border-b border-[#2E2F2F]">
            <AvatarUpload 
              userId={user.id} 
              userEmail={user.email} 
              currentAvatarUrl={user.avatarUrl} 
            />
            <div className="text-xl mb-7 text-muted-foreground text-center sm:text-left">
              <p className="font-bold text-foreground">{user.name}</p>
              <p>{user.role}</p>
            </div>
          </div>

          {/* Info Form */}
          <form action={handleInfoSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                value={user.email} 
                disabled 
                className="bg-black/20 border-[#2E2F2F] text-muted-foreground cursor-not-allowed h-11 md:h-10 text-base md:text-sm" 
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Display Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  defaultValue={user.name || ""} 
                  className="bg-black/20 border-[#2E2F2F] h-11 md:h-10 text-base md:text-sm" 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="mobileNumber">Phone Number</Label>
                <Input 
                  id="mobileNumber" 
                  name="mobileNumber" 
                  defaultValue={user.mobileNumber || ""} 
                  onInput={(e) => {
                    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, "")
                  }}
                  className="bg-black/20 border-[#2E2F2F] h-11 md:h-10 text-base md:text-sm" 
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button disabled={infoPending} type="submit" className="w-full md:w-auto h-12 md:h-10">
                {infoPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Details
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* CARD 2: SECURITY (PASSWORD) */}
      <Card className="bg-[#171717] border-[#2E2F2F]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-orange-500" />
            Security
          </CardTitle>
          <CardDescription>Manage your password and account security.</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="password-form" action={handlePassSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2  relative">
                <Label htmlFor="confirmPassword">New Password</Label>
                <Input 
                  id="newPassword" 
                  name="newPassword" 
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                 className="bg-black/20 border-[#2E2F2F] pr-10 h-11 md:h-10 text-base md:text-sm"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 mt-10  -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                    ) : (
                    <Eye className="w-5 h-5" />
                    )}
                </button>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  type="password" 
                  placeholder="••••••••"
                  required
                  className="bg-black/20 border-[#2E2F2F] h-11 md:h-10 text-base md:text-sm" 
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                disabled={passPending} 
                type="submit" 
                variant="secondary" 
                className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-orange-500/20 border w-full md:w-auto h-12 md:h-10"
              >
                {passPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                Update Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

    </div>
  )
}