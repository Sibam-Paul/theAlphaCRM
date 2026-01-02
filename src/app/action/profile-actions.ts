'use server'

import { createClient } from "@/utils/supabase/server"
import { db } from "@/db"
import { users } from "@/db/schema"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { eq, ilike, or, and, ne, desc } from "drizzle-orm"

// to prevent malacious script from the users 
const PAGE_SIZE = 20

const ProfileSchema = z.object({
  name: z.string().min(2, "Name too short").max(50, "Name too long").regex(/^[a-zA-Z\s\-\.]+$/, "Invalid characters in name"),
  mobileNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format (E.164 compliant)"),
})

// Action 1: Update Name & Phone
export async function updateProfileInfo(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()


  if (!user) return { success: false, error: "Unauthorized" }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    columns: { updatedAt: true } // Ensure your schema has this column!
  })

  if (dbUser?.updatedAt) {
    const lastUpdate = new Date(dbUser.updatedAt).getTime()
    const now = Date.now()
    const COOLDOWN_MS = 10000 

    if (now - lastUpdate < COOLDOWN_MS) {
      return { success: false, error: "Please wait 10 seconds before updating again." }
    }
  }
    
  const rawData = {
    name: formData.get("name") as string,
    mobileNumber: formData.get("mobileNumber") as string,
  }

  const validation = ProfileSchema.safeParse(rawData)

  if (!validation.success) {
    // Return the first error message to the user
    return { success: false, error: validation.error.errors[0].message }
  }

  const { name, mobileNumber } = validation.data

  try {
    // Check if mobile number is taken by someone else
    if (mobileNumber) {
      const existing = await db.query.users.findFirst({
        where: eq(users.mobileNumber, mobileNumber)
      })
      if (existing && existing.id !== user.id) {
        return { success: false, error: "Mobile number already in use." }
      }
    }


    await db.update(users)
      .set({ name, mobileNumber }) 
      .where(eq(users.id, user.id))

    revalidatePath('/dashboard/profile')
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to update profile." }
  }
}

// Action 2: Change Password
export async function changePassword(formData: FormData) {
  const supabase = await createClient()
  
  const newPassword = formData.get("newPassword") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (newPassword !== confirmPassword) {
    return { success: false, error: "Passwords do not match" }
  }

  if (newPassword.length < 6) {
    return { success: false, error: "Password must be at least 6 characters" }
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
 
}
export async function updateAvatar(url: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
    const ALLOWED_DOMAIN = process.env.NEXT_PUBLIC_SUPABASE_URL || "supabase.co";


  if (!user) return { success: false, error: "Unauthorized" }

  
 if (!url.startsWith(ALLOWED_DOMAIN) && !url.includes("avatar.vercel.sh")) {
     return { success: false, error: "Invalid image source. Only system uploads allowed." }
  }

  try {
    await db.update(users)
      .set({ avatarUrl: url })
      .where(eq(users.id, user.id))

    // ⚡ FIX: Don't revalidate '/', only the dashboard
    revalidatePath('/dashboard/profile')
    revalidatePath('/dashboard') 
    return { success: true }
  } catch (error) {
    // ... error handling
  }

}


//  fetching limited users only (lazy loading)
export async function fetchUsers(offset: number, search: string, currentUserId: string) {
  try {
    // 1. Build Search Filter (Name OR Email)
    const searchFilter = search 
      ? or(ilike(users.name, `%${search}%`), ilike(users.email, `%${search}%`))
      : undefined

    // 2. Exclude current admin from list
    const whereClause = searchFilter 
      ? and(searchFilter, ne(users.id, currentUserId)) 
      : ne(users.id, currentUserId)

    // 3. Fetch Data
    const data = await db.query.users.findMany({
      where: whereClause,
      orderBy: [desc(users.createdAt)],
      limit: PAGE_SIZE,
      offset: offset,
      columns: {
        id: true,
        email: true,
        name: true,
        mobileNumber: true,
        role: true,
        createdAt: true,
        avatarUrl: true,
      }
    })

    // 4. Check if there are more results
    const hasMore = data.length === PAGE_SIZE

    return { success: true, data, hasMore }
  } catch (error) {
    console.error("Fetch Error:", error)
    return { success: false, data: [], hasMore: false }
  }
}