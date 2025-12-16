import Link from "next/link";
import { Button } from "@/components/ui/button";
import LoginPage from "@/app/auth/login/page"

export default function LandingPage() {
  return (
    // <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
    //   <h1 className="text-4xl font-bold tracking-tight">CRM Landing Page</h1>
    //   <p className="mt-4 text-muted-foreground">
    //     Welcome to the CRM. Please log in to continue.
    //   </p>
    //   <div className="mt-8">
    //     <Link href="/auth/login">
    //       <Button size="lg">Go to Login</Button>
    //     </Link>
    //   </div>
    // </div>
    <LoginPage />
  );
}