"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import {
  LayoutDashboard,
  Lightbulb,
  FileText,
  BookOpen,
  Video,
  BarChart2,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pitches", label: "Pitches", icon: Lightbulb },
  { href: "/scripts", label: "Scripts", icon: FileText },
  { href: "/concepts", label: "Concepts", icon: BookOpen },
  { href: "/videos", label: "Videos", icon: Video },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="fixed inset-y-0 left-0 w-56 bg-slate-950 border-r border-slate-800/60 flex flex-col z-30">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-800/60">
        <h1 className="font-serif text-2xl text-amber-400 tracking-tight">Mundy</h1>
        <p className="text-slate-600 text-xs mt-0.5">Content Studio</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                active
                  ? "bg-amber-500/10 text-amber-400"
                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
              )}
            >
              <Icon
                size={16}
                className={active ? "text-amber-400" : "text-slate-600"}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-slate-800/60">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-slate-600 hover:text-slate-300 hover:bg-slate-800/50 w-full transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
