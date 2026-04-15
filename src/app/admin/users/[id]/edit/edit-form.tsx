"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Loader2, UserCog, Building2, Eye, EyeOff } from "lucide-react";

type EditUserFormProps = {
  user: any; // Data yang dioper dari page.tsx
};

export default function EditUserForm({ user }: EditUserFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false); // Default hide buat edit

  // Logic Formatting Date biar kebaca di input type="date" (YYYY-MM-DD)
  const formattedDate = user.activeUntil 
    ? new Date(user.activeUntil).toISOString().split('T')[0] 
    : "";

  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    password: "", // Kosongin! Biar DB tahu kalau kosong = ga ganti password
    phone: user.phone || "",
    role: user.role || "CLIENT",
    companyName: user.companyName || "",
    activeUntil: formattedDate, 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update user");
      }

      router.push("/admin/users");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-slate-200 shadow-2xl overflow-hidden bg-white rounded-2xl">
      <CardHeader className="bg-slate-50/70 border-b border-slate-100 px-8 py-6">
        <div className="flex items-center gap-4">
          <div className="bg-amber-100/60 p-3 rounded-full border border-amber-200">
             <UserCog className="h-6 w-6 text-amber-600" />
          </div>
          <div>
             <CardTitle className="text-2xl font-bold tracking-tight text-slate-950">
               Account Details
             </CardTitle>
             <CardDescription className="text-slate-600 mt-0.5">
               Leave the password field blank if you don&apos;t want to change it.
             </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-8 space-y-8">
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-8">
          {error && (
            <div className="flex items-center gap-2 p-4 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
              <p>⚠️ {error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
            {/* Kolom Kiri */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-bold text-slate-900">Full Name *</Label>
                <Input 
                  id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nama Lengkap" required 
                  className="border-slate-300 focus:border-amber-500 focus:ring-amber-500/30 text-slate-950 bg-slate-50 shadow-inner"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-bold text-slate-900">Email Address *</Label>
                <Input 
                  id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Alamat Email" required 
                  className="border-slate-300 focus:border-amber-500 focus:ring-amber-500/30 text-slate-950 bg-slate-50 shadow-inner"
                />
              </div>
              <div className="space-y-2 group">
                <Label htmlFor="password" className="text-sm font-bold text-slate-900">New Password (Optional)</Label>
                <div className="relative">
                  <Input 
                    id="password" type={showPassword ? "text" : "password"} autoComplete="new-password" 
                    value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Kosongkan jika tidak ingin ganti" 
                    className="border-slate-300 pr-10 focus:border-amber-500 focus:ring-amber-500/30 text-slate-950 bg-slate-50 shadow-inner"
                  />
                  <button 
                    type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Kolom Kanan */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-bold text-slate-900">Phone Number</Label>
                <Input 
                  id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+62 8..." 
                  className="border-slate-300 focus:border-amber-500 focus:ring-amber-500/30 text-slate-950 bg-slate-50 shadow-inner"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-bold text-slate-900">System Role *</Label>
                <select 
                  id="role" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="flex h-12 w-full rounded-md border border-slate-300 bg-slate-50 text-slate-950 px-4 py-3 text-base font-medium focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 shadow-inner transition duration-150"
                >
                  <option value="CLIENT">CLIENT</option>
                  <option value="STAFF">STAFF</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>
          </div>

          {/* Conditional Rendering CLIENT */}
          {formData.role === "CLIENT" && (
            <div className="pt-8 mt-10 border-t border-slate-100 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3">
                 <div className="bg-emerald-100/60 p-3 rounded-full border border-emerald-200">
                   <Building2 className="h-6 w-6 text-emerald-600" />
                 </div>
                 <h3 className="text-xl font-bold tracking-tight text-slate-950">Client Contract Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-sm font-bold text-slate-900">Company Name *</Label>
                  <Input 
                    id="companyName" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Nama Perusahaan PT/CV" required={formData.role === "CLIENT"} 
                    className="border-slate-300 focus:border-amber-500 focus:ring-amber-500/30 text-slate-950 bg-slate-50 shadow-inner"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activeUntil" className="text-sm font-bold text-slate-900">Contract Active Until *</Label>
                  <Input 
                    id="activeUntil" type="date" value={formData.activeUntil} onChange={(e) => setFormData({ ...formData, activeUntil: e.target.value })}
                    required={formData.role === "CLIENT"} 
                    className="border-slate-300 focus:border-amber-500 focus:ring-amber-500/30 text-slate-950 bg-slate-50 shadow-inner [color-scheme:light]"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-8 mt-10 border-t border-slate-100 flex justify-end gap-4">
            <Link href="/admin/users">
              <Button type="button" variant="outline" className="h-12 px-8 text-base font-semibold border-slate-300 bg-white hover:bg-slate-100 text-slate-950 shadow-sm rounded-xl">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading} className="h-12 px-8 text-base font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-xl hover:shadow-2xl transition duration-150 rounded-xl">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isLoading ? "Updating..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}