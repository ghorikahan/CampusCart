"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Heart,
  MessageSquare,
  Settings,
  LogOut,
  Package,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/ui/avatar";

interface UserNavProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function UserNav({ user }: UserNavProps) {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full ring-offset-background transition hover:ring-2 hover:ring-primary/40 focus:outline-none">
        <Avatar
          src={user.image}
          fallback={user.name || "CC"}
          size="sm"
          className="cursor-pointer"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="right" className="w-56 p-1.5 shadow-xl">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-0.5">
            <p className="text-sm font-semibold text-foreground truncate">
              {user.name || "Student"}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <Link href="/dashboard">
          <DropdownMenuItem>
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
            <span>Dashboard</span>
          </DropdownMenuItem>
        </Link>

        <Link href="/dashboard/listings">
          <DropdownMenuItem>
            <Package className="h-4 w-4 text-muted-foreground" />
            <span>My Listings</span>
          </DropdownMenuItem>
        </Link>

        <Link href="/favorites">
          <DropdownMenuItem>
            <Heart className="h-4 w-4 text-muted-foreground" />
            <span>Saved Items</span>
          </DropdownMenuItem>
        </Link>

        <Link href="/enquiries">
          <DropdownMenuItem>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <span>My Enquiries</span>
          </DropdownMenuItem>
        </Link>

        <Link href="/settings/profile">
          <DropdownMenuItem>
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span>Settings</span>
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleSignOut} destructive>
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

