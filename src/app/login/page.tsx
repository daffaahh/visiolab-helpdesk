"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Sesuaikan path import UI components lo
import { AnimatedBackground } from "@/src/components/ui/animated-background";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Card, CardContent, CardHeader, CardDescription } from "@/src/components/ui/card";
import { Label } from "@/src/components/ui/label";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

import VisiolabLogo from "@/public/images/visiolab_logo.png";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // New States for precise UX feedback
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Set redirect: false biar kita bisa handle error response secara manual di client
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false, 
      });

      if (res?.error) {
        // Handle invalid credentials
        setError("Invalid email or password. Coba cek lagi.");
        setIsLoading(false);
      } else if (res?.ok) {
        // Success -> Redirect sesuai role: internal ke /admin, client ke /portal
        const session = await getSession();
        const role = session?.user?.role;
        router.push(role === "ADMIN" || role === "STAFF" ? "/admin/dashboard" : "/portal/dashboard");
      }
    } catch (err) {
      setError("System error. Coba beberapa saat lagi.");
      setIsLoading(false);
    }
  };

    return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 p-4">
      
      <AnimatedBackground />

      {/* Subtle ambient glow effect in the background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Changed max-w-lg to max-w-md to make it slimmer */}
      <Card className="relative w-full max-w-md shadow-2xl rounded-2xl border border-slate-800/60 bg-slate-900/80 backdrop-blur-xl overflow-hidden z-10 transition-all">
        
        {/* Trimmed padding and space-y */}
        <CardHeader className="px-8 pt-8 pb-2 text-center space-y-1">
          <Image 
            src={VisiolabLogo} 
            alt="Visiolab.ID Logo" 
            className="mx-auto w-44 h-auto drop-shadow-md mb-2" // Added explicit width to lock logo size
            priority 
          />
          <CardDescription className="text-xs font-semibold text-slate-400 tracking-widest uppercase">
            Helpdesk Portal
          </CardDescription>
        </CardHeader>
        
        {/* Adjusted top padding to pull form closer to header */}
        <CardContent className="px-8 pb-8 pt-4">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-400 bg-red-950/50 border border-red-900/50 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-2 group">
              <Label htmlFor="email" className="text-slate-300 text-sm group-focus-within:text-blue-500 transition-colors">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4 transition-colors group-focus-within:text-blue-500" />
                <Input 
                  id="email"
                  type="email" 
                  autoComplete="on"
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  disabled={isLoading}
                  className="pl-10 h-11 text-sm text-slate-100 placeholder:text-slate-600 bg-slate-950/50 border-slate-800 focus:ring-2 focus:ring-blue-600/50 focus:border-blue-500 transition-all duration-200 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-300 text-sm group-focus-within:text-blue-500 transition-colors">
                  Password
                </Label>
                <Link href="#" className="text-xs font-medium text-slate-400 hover:text-blue-500 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4 transition-colors group-focus-within:text-blue-500" />
                <Input 
                  id="password"
                  type={showPassword ? "text" : "password"} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  disabled={isLoading}
                  className="pl-10 h-11 pr-10 text-sm text-slate-100 placeholder:text-slate-600 bg-slate-950/50 border-slate-800 focus:ring-2 focus:ring-blue-600/50 focus:border-blue-500 transition-all duration-200 disabled:opacity-50"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-50"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-11 mt-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-[0_0_20px_-5px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_-5px_rgba(37,99,235,0.6)] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Log in to Helpdesk"
              )}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800/60 text-center text-xs text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="#" className="font-semibold text-slate-300 hover:text-white transition-colors">
              Request access
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}