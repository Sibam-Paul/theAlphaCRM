"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, UserPlus } from "lucide-react"
import { createUser } from "@/app/action/create-user"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner" // Assuming you have sonner or use-toast

export function AddUserForm() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    
    // 1. Capture the form element BEFORE the await
    const form = e.currentTarget 
    const formData = new FormData(form)
    
    const result = await createUser(formData)
    
    setIsLoading(false)

    if (result.success) {
      toast.success("User created successfully!")
      // 2. Use the captured variable instead of e.currentTarget
      form.reset() 
    } else {
      toast.error("Error: " + result.error)
    }
  }

  return (
    <Card className="max-w-2xl bg-[#171717] border border-[#2E2F2F] ">
      <CardHeader>
        <CardTitle>Create New User</CardTitle>
      
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <input 
              id="name" 
              name="name" 
              placeholder="Enter First Name" 
              required 
              className="pl-3 h-9 w-full border rounded-md bg-transparent outline-none border-[#373737] focus:ring-2 focus:ring-[#575757]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="Enter Email Address" 
              required 
              className="pl-3 h-9 w-full border rounded-md bg-transparent outline-none border-[#373737] focus:ring-2 focus:ring-[#575757]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobileNumber">Mobile Number</Label>
            <input 
              id="mobileNumber" 
              name="mobileNumber" 
              placeholder="Mobile Number" 
              required 
              className="pl-3 h-9 w-full border rounded-md bg-transparent outline-none border-[#373737] focus:ring-2 focus:ring-[#575757]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <select 
              name="role" 
              id="role"
              className="flex h-10 rounded-md border border-[#373737] bg- bg-[#222223] px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <option value="user">User</option>
                <option value="admin">Admin</option>
            </select>
          </div>

          <Button type="submit" disabled={isLoading} className="w-[30%] h-10 bg-white text-black font-bold hover:bg-[#E5E5E5]">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><UserPlus className="mr-2 h-4 w-4"/> Create Account</>}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}