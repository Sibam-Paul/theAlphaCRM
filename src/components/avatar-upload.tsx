"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { updateAvatar } from "@/app/action/profile-actions" // Make sure this action exists!
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Camera } from "lucide-react"
import { toast } from "sonner"

interface AvatarUploadProps {
  userId: string
  currentAvatarUrl?: string | null
  userEmail: string
}

export function AvatarUpload({ userId, currentAvatarUrl, userEmail }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentAvatarUrl)
  const supabase = createClient()

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      const file = event.target.files?.[0]
      if (!file) return

      const fileExt = file.name.split('.').pop()
      // Create a unique file name
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      // 1. Upload to 'profile_pic' bucket
      const { error: uploadError } = await supabase.storage
        .from('profile_pic') // 👈 Ensure your bucket is named 'profile_pic'
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // 2. Get the Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile_pic')
        .getPublicUrl(filePath)

      // 3. Save to DB (using the server action)
      // Note: If you put updateAvatar in a different file, import it correctly.
      // We previously put it in "@/app/action/profile-actions"
      const result = await updateAvatar(publicUrl)
      
      if (result?.success) {
        setPreview(publicUrl)
        toast.success("Profile Photo Updated")
      } else {
        throw new Error(result?.error)
      }

    } catch (error: any) {
      toast.error("Upload Failed", { description: error.message })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <Avatar className="h-24 w-24 border-2 border-dashed border-muted-foreground/25 group-hover:border-solid transition-all cursor-pointer">
          <AvatarImage src={preview || `https://avatar.vercel.sh/${userEmail}.png`} className="object-cover" />
          <AvatarFallback className="text-2xl">{userEmail[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        
        {/* Hidden Input + Overlay Label */}
        <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
           {uploading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" />}
        </label>
        <input
          type="file"
          id="avatar-upload"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
          disabled={uploading}
        />
      </div>
      <p className="text-xs text-muted-foreground">Click image to upload</p>
    </div>
  )
}