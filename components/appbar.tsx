"use client"
import { signIn, signOut, useSession} from  "next-auth/react";
import { Button } from "@/components/ui/button"
import { Music} from "lucide-react"
import Link from "next/link"

export function Appbar(){
   const handleGoogleSignIn = () => signIn("google", { callbackUrl: "/" })
    const session = useSession();
    return  <header className="px-4 lg:px-6 h-16 flex items-center border-b border-gray-800 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
        <Link href="/" className="flex items-center justify-center gap-2">
          <div className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center">
            <Music className="h-5 w-5 text-black" />
          </div>
          <span className="text-xl font-bold text-white">MusicShroom</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="#features" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            How it Works
          </Link>
        </nav>
        <div className="ml-4 flex gap-2">
        {session.data?.user &&  <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-800" onClick={() => signOut()}>
            Sign out
          </Button>}
         {!session.data?.user && <Button size="sm" className="bg-green-500 hover:bg-green-600 text-black font-medium" onClick={handleGoogleSignIn}>
            Sign in
          </Button>}
        </div>
      </header>
     
}