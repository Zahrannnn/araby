import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function NotFound() {
  
  return (
    <main className="relative flex min-h-[80vh] flex-col items-center justify-center">
      {/* Background gradient effect */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,var(--primary)_0,var(--background)_100%)] opacity-15" />
      
      <div className="flex flex-col items-center gap-6 px-4 text-center sm:px-6 lg:px-8">
        <div className="space-y-4">
          <div className="relative">
            <h1 className="bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-8xl font-extrabold tracking-tighter text-transparent sm:text-9xl">
              404
            </h1>
            <div className="absolute -bottom-2 left-0 h-0.5 w-full bg-gradient-to-r from-transparent via-primary to-transparent" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Page Not Found
          </h2>
          <p className="max-w-md text-muted-foreground">
            The page you are looking for does not exist.
          </p>
        </div>
        
        <Button 
          asChild 
          variant="default" 
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </main>
  )
}