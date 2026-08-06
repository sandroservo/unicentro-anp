"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { SidebarProvider, useSidebar } from "@/context/sidebar-context";
import { isAdminRole } from "@/lib/rbac";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { Backdrop } from "./backdrop";

function Shell({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { data: session } = useSession();
  const pathname = usePathname();
  const role = (session?.user?.role as string) || "ALUNO";
  const showSidebar = isAdminRole(role) && !pathname.startsWith("/aluno");

  const mainContentMargin = !showSidebar
    ? "ml-0"
    : isMobileOpen
      ? "ml-0"
      : isExpanded || isHovered
        ? "lg:ml-[290px]"
        : "lg:ml-[90px]";

  return (
    <div className="min-h-screen bg-gray-50 xl:flex dark:bg-gray-900">
      {showSidebar && (
        <>
          <Sidebar />
          <Backdrop />
        </>
      )}
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
