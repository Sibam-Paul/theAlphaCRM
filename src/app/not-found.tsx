import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

export default function NotFound() {
  return (
<div className="relative h-screen w-full flex flex-col items-center justify-center bg-[#0A0A0A] overflow-hidden">
      
      {/* LOGO: Added 'absolute', 'top-6', 'left-6' to fix it to the corner */}
      <svg 
        fill="currentColor" 
        viewBox="0 0 100 100" 
        xmlns="http://www.w3.org/2000/svg" 
        aria-hidden="true" 
        className="absolute top-6 left-6 size-10 md:size-10 text-white"
      >
        <path d="M50 10L80 80H65L50 50L35 80H20L50 10Z" fill="currentColor"></path>
        <circle cx="50" cy="35" r="5" fill="currentColor"></circle>
      </svg>

      {/* Subtle spotlight/glow effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-white/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-4 animate-in fade-in zoom-in duration-500">
        {/* Massive Professional 404 Typography */}
        <h1 className="text-[120px] md:text-[180px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-white to-white/10 select-none">
          404
        </h1>

        <div className="space-y-4 max-w-md -mt-2.5 md:-mt-5">
          <h2 className="text-2xl md:text-3xl font-medium text-foreground">
            Page not found
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="mt-10">
          <Button 
            asChild 
            size="lg" 
            className="h-12 px-8 bg-white text-black hover:bg-[#E5E5E5] font-bold rounded-full transition-transform active:scale-95"
          >
            <Link href="/dashboard" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Return to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}