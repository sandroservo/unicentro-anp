"use client";

import { SidebarProvider, useSidebar } from "@/context/sidebar-context";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { Backdrop } from "./backdrop";

function Shell({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "lg:ml-[290px]"
      : "lg:ml-[90px]";

  return (
    <div className="min-h-screen bg-gray-50 xl:flex dark:bg-gray-900">
      <Sidebar />
      <Backdrop />
      <div
        className={`flex min-h-screen flex-1 flex-col transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        <Topbar />
        <main className="mx-auto w-full max-w-[1536px] flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Shell>{children}</Shell>
    </SidebarProvider>
  );
}
