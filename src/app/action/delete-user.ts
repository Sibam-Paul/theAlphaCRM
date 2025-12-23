'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from "drizzle-orm"
import { createClient as createSupabaseServer } from "@/utils/supabase/server"

export async function deleteUser(formData: FormData) {

  const supabase = await createSupabaseServer()
  const { data: { user: currentAdmin } } = await supabase.auth.getUser()

  if (!currentAdmin || !currentAdmin.email) {
    return { success: false, error: "Unauthorized: No session found." }
  }

  
  const targetUserId = formData.get('targetUserId') as string
  const adminPassword = formData.get('adminPassword') as string

  if (!targetUserId || !adminPassword) {
    return { success: false, error: "Missing required fields." }
  }

 
  if (targetUserId === currentAdmin.id) {
    return { success: false, error: "Operation Failed: You cannot delete your own admin account." }
  }


  const dbAdmin = await db.query.users.findFirst({
    where: eq(users.id, currentAdmin.id),
    columns: { role: true }
  })

  if (dbAdmin?.role !== 'admin') {
    return { success: false, error: "Access Denied: Admins only." }
  }

  const verifyClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    }
  )

  const { error: authVerifyError } = await verifyClient.auth.signInWithPassword({
    email: currentAdmin.email, 
    password: adminPassword,
  })

  if (authVerifyError) {
    console.error("Password Verification Failed:", authVerifyError.message)
    if (authVerifyError.message.includes("Too many requests")) {
       return { success: false, error: "Too many attempts. Please wait a moment." }
    }
    return { success: false, error: "Incorrect admin password." }
  }

  
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, 
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  try {
    
    await db.delete(users).where(eq(users.id, targetUserId))

    // Then delete from Auth
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId)
    
    if (deleteAuthError && !deleteAuthError.message.includes("User not found")) {
      // If Auth delete fails, log it. The user is removed from the App (DB), 
      // effectively banning them, even if their Auth record lingers.
      console.error("Warning: User deleted from DB but Auth deletion failed:", deleteAuthError)
    }
    
    revalidatePath('/dashboard/users')
    return { success: true }
  } catch (error: any) {
    console.error('Delete Error:', error)
    return { success: false, error: "System failed to complete deletion." }
  }
}