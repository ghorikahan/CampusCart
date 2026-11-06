import { type Metadata } from "next";
import { ShoppingBag, Users, Sparkles, BookOpen, HeartHandshake } from "lucide-react";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export const metadata: Metadata = {
  title: "Create an Account | CampusCart",
  description: "Join your university student marketplace community on CampusCart.",
};

export default function RegisterPage() {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] w-full lg:grid-cols-2">
      {/* Left Column: Branding & Features (Hidden on mobile) */}
      <div className="relative hidden flex-col justify-between bg-zinc-950 p-10 text-white lg:flex dark:border-r dark:border-border">
        {/* Background gradient */}
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
            Join your student community today
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
            Give college essentials a second life.
          </h2>
          <p className="text-base text-zinc-400">
            Create an account in 30 seconds. Connect directly with students from your campus, list items for sale, exchange study materials, or pick up free dorm essentials.
          </p>

          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-primary">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-200">Affordable Course Material</h4>
                <p className="text-xs text-zinc-400">Save hundreds of dollars on engineering, medical, and literature textbooks.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-primary">
                <HeartHandshake className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-200">Zero Transaction Fees</h4>
                <p className="text-xs text-zinc-400">Keep 100% of your earnings when passing down dorm and study gear.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-primary">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-200">Trusted Student Profiles</h4>
                <p className="text-xs text-zinc-400">See verified university, course, and peer feedback on seller profiles.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stat Card */}
        <div className="relative z-10 grid grid-cols-3 gap-4 rounded-xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm">
          <div>
            <div className="text-xl font-bold text-white">40+</div>
            <div className="text-xs text-zinc-400">Categories</div>
          </div>
          <div>
            <div className="text-xl font-bold text-white">100%</div>
            <div className="text-xs text-zinc-400">Peer Direct</div>
          </div>
          <div>
            <div className="text-xl font-bold text-white">Free</div>
            <div className="text-xs text-zinc-400">Dorm Exchanges</div>
          </div>
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

        <RegisterForm />
      </div>
    </div>
  );
}
