"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  MessageSquare,
  LayoutDashboard,
  Users,
  CreditCard,
  Lightbulb,
  Menu,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/chat", label: "دستیار هوش مصنوعی", icon: MessageSquare, badge: "AI" },
  { href: "/dashboard", label: "داشبورد", icon: LayoutDashboard },
  { href: "/insights", label: "بینش‌های کلیدی", icon: Lightbulb, badge: "جدید" },
  { href: "/merchants", label: "پذیرندگان", icon: Users },
  { href: "/psp", label: "تحلیل PSP", icon: CreditCard },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F5F5]">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:relative z-50 h-full bg-white border-l border-[#DADBE1] transition-all duration-300 flex flex-col",
          sidebarOpen ? "w-64" : "w-[72px]",
          mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#DADBE1]">
          {sidebarOpen ? (
            <Link href="/" className="flex items-center gap-3">
              <img src="/zarinpal-logo.svg" alt="زرین‌پال" className="w-9 h-9 object-contain" />
              <div>
                <h1 className="text-sm font-bold text-[#19191A]">زرین‌پال</h1>
                <p className="text-[10px] text-[#6b7280]">آنالیتیکس</p>
              </div>
            </Link>
          ) : (
            <img src="/zarinpal-logo.svg" alt="زرین‌پال" className="w-9 h-9 object-contain mx-auto" />
          )}
          <button
            onClick={() => {
              if (mobileOpen) setMobileOpen(false);
              else setSidebarOpen(!sidebarOpen);
            }}
            className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg hover:bg-[#F5F5F5] text-[#6b7280]"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                  isActive
                    ? "bg-[#0A33FF] text-white shadow-sm"
                    : "text-[#6b7280] hover:bg-[#F5F5F5] hover:text-[#19191A]"
                )}
              >
                <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-white")} />
                {sidebarOpen && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                          item.badge === "AI"
                            ? "bg-white/20 text-white"
                            : "bg-[#FFD60A]/20 text-[#19191A]"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-[#DADBE1]">
          {sidebarOpen ? (
            <div className="flex items-center gap-3 px-3 py-2">
              <img src="/zarinpal-logo.svg" alt="زرین‌پال" className="w-8 h-8 object-contain" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[#19191A] truncate">زرین‌پال آنالیتیکس</p>
                <p className="text-[10px] text-[#6b7280]">v1.0.0</p>
              </div>
            </div>
          ) : (
            <img src="/zarinpal-logo.svg" alt="زرین‌پال" className="w-8 h-8 object-contain mx-auto" />
          )}
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-[#DADBE1] z-30 flex items-center px-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#F5F5F5]"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex-1 flex items-center justify-center gap-2">
          <img src="/zarinpal-logo.svg" alt="زرین‌پال" className="w-7 h-7 object-contain" />
          <span className="text-sm font-bold text-[#19191A]">زرین‌پال آنالیتیکس</span>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto lg:pt-0 pt-14">{children}</main>
    </div>
  );
}
