'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Email validation
  const emailRegex = /^[a-zA-Z0-9.@]+$/
  if (!emailRegex.test(email)) {
    return { error: 'Email can only contain letters, numbers, @ and .' }
  }
  if (!email.includes('@') || !email.includes('.')) {
    return { error: 'Email must contain @ and .' }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Distinguish between invalid email and wrong password
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'Invalid email or password' }
    }
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}