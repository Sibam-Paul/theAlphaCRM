'use server'

// 1. Rename this import to avoid conflict
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js' 
import { revalidatePath } from 'next/cache'
import { db } from '@/db' 
import { users } from '@/db/schema' 
import { eq } from "drizzle-orm" 
import { createClient as createSupabaseServer } from "@/utils/supabase/server" 
import { toast } from "sonner"

export async function createUser(formData: FormData) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { success: false, error: "Unauthorized" }

  const dbUser = await db.select({ role: users.role })
    .from(users)
    .where(eq(users.id, user.id))

  if (dbUser[0]?.role !== 'admin') {
     return { success: false, error: "Unauthorized: Admins only." }
  }
  
  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Extract Data
  const email = formData.get('email') as string
  const role = formData.get('role') as string
  const name = formData.get('name') as string
  const mobileNumber = formData.get('mobileNumber') as string
  
  if (!email || email.length < 6) {
     toast.error("Creation Failed", {
        description: "Email must be at least 6 characters long."
      })
    return { success: false, error: "Email must be at least 6 characters long." }
  }
  // Generate Password
  const cleanName = name.split(' ')[0];
  const mobilePrefix = mobileNumber.substring(0, 4);
  const password = `${cleanName.toLowerCase()}@${mobilePrefix}`;

  // Create Auth User
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: password,
    email_confirm: true,
    user_metadata: { name: name }
  })

  if (authError) {
    return { success: false, error: authError.message }
  }

  // Create Public User Record
  if (authData.user) {
    try {
      await db.insert(users).values({
        id: authData.user.id,
        email: email,
        name: name,
        mobileNumber: mobileNumber,
        role: role as 'admin' | 'user',
      })
    } catch (dbError: any) {
      console.error('DB Error:', dbError)
      
      // Cleanup: Delete the auth user if DB fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      
      if (dbError.code === '23505') {
         return { success: false, error: 'Email or Mobile Number already exists.' }
      }
      return { success: false, error: 'Failed to save user profile.' }
    }
  }

  revalidatePath('/dashboard')
  return { success: true }
}