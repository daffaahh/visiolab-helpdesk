"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { LogOut, ArrowLeft, Info, Loader2 } from "lucide-react";
import { AnimatedBackground } from "@/src/components/ui/animated-background";

export default function CustomLogoutPage() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = () => {
    setIsLoggingOut(true);
    
    // Logic Fortress: Hold eksekusi 3 detik buat UI feedback, baru lempar ke NextAuth
    setTimeout(async () => {
      await signOut({ callbackUrl: "/login" });
    }, 3000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 p-4">
      <AnimatedBackground />
      <Card className="w-full max-w-md shadow-2xl rounded-2xl border border-slate-800/60 bg-slate-900/80 backdrop-blur-xl overflow-hidden text-center p-2">
        {!isLoggingOut ? (
          <>
            <CardHeader className="space-y-4 pt-8">
              <div className="mx-auto bg-slate-800/50 p-4 rounded-full w-fit">
                <LogOut className="h-8 w-8 text-blue-500" />
              </div>
              <CardTitle className="text-xl text-slate-100">Ready to leave?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 mt-2 pb-8">
              <p className="text-sm text-slate-400">
                You are about to securely log out from Visiolab Helpdesk.
              </p>
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => router.back()} 
                  className="w-full border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white transition-all h-11"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
                </Button>
                <Button 
                  onClick={handleSignOut} 
                  className="w-full bg-red-600/90 hover:bg-red-500 text-white shadow-lg shadow-red-900/20 transition-all h-11"
                >
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="py-16 space-y-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 bg-blue-500/10 rounded-full animate-pulse border border-blue-500/20">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-100 animate-in fade-in zoom-in duration-300">
                Signing off...
              </h3>
              <p className="text-sm text-blue-400 font-medium px-4 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
                "Don't forget to report to your PIC or SPV"
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}