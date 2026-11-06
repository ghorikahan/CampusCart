import { type Metadata } from "next";
import { ShoppingBag, ShieldCheck, ArrowRightLeft, Sparkles } from "lucide-react";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata: Metadata = {
  title: "Sign In | CampusCart",
  description: "Sign in to your CampusCart student account.",
};

export default function LoginPage() {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] w-full lg:grid-cols-2">
      {/* Left Column: Branding & Features (Hidden on mobile) */}
      <div className="relative hidden flex-col justify-between bg-zinc-950 p-10 text-white lg:flex dark:border-r dark:border-border">
        {/* Background gradient pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-zinc-950/80 to-zinc-950" />
        
        {/* Top Branding */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">CampusCart</span>
          <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
            Student Marketplace
          </span>
        </div>

        {/* Center Content */}
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs text-zinc-300">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Designed exclusively for university campuses
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
            Smart peer-to-peer commerce for campus life.
          </h2>
          <p className="text-base text-zinc-400">
            Buy course textbooks, trade electronics, or find affordable dorm furniture from fellow students right on your campus.
          </p>

          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-primary">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-200">Verified Campus Community</h4>
                <p className="text-xs text-zinc-400">Meet up safely on campus without shipping delays or strangers.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-primary">
                <ArrowRightLeft className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-200">Direct Enquiries & Offers</h4>
                <p className="text-xs text-zinc-400">Negotiate fair student prices with structured offers and zero platform cuts.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Testimonial */}
        <div className="relative z-10 rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-zinc-400 backdrop-blur-sm">
          <p className="italic text-zinc-300">
            &ldquo;CampusCart made it so easy to hand down my previous semester textbooks to incoming students in my dorm hall.&rdquo;
          </p>
          <p className="mt-2 font-medium text-white">— Alex Chen, Computer Science Senior</p>
        </div>
      </div>

      {/* Right Column: Form Container */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-12 lg:p-16 bg-background">
        {/* Mobile Header Branding */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow">
            <ShoppingBag className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">CampusCart</span>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
