"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

type Item = {
  id: string;
  studentName: string;
  lessonTitle: string;
  courseTitle: string;
  at: string;
};

const SEEN_KEY = "notif:lastSeen";

function timeAgo(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "agora";
  const m = Math.floor(s / 60);
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h} h`;
  return `há ${Math.floor(h / 24)} d`;
}

export function NotificationBell() {
  const [mounted, setMounted] = useState(false);
  const [lastSeen, setLastSeen] = useState(0);

  useEffect(() => {
    setMounted(true);
    setLastSeen(Number(localStorage.getItem(SEEN_KEY) ?? 0));
  }, []);

  const { data } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async (): Promise<Item[]> => {
      const res = await fetch("/api/admin/notifications");
      if (!res.ok) return [];
      return (await res.json()).items ?? [];
    },
    refetchInterval: 30_000, // atualiza conforme alunos concluem aulas
    refetchOnWindowFocus: true,
  });

  const items = data ?? [];
  const unread = mounted
    ? items.filter((i) => new Date(i.at).getTime() > lastSeen).length
    : 0;

  const markSeen = (open: boolean) => {
    if (open && items.length) {
      const now = Date.now();
      localStorage.setItem(SEEN_KEY, String(now));
      setLastSeen(now);
    }
  };

  return (
    <DropdownMenu onOpenChange={markSeen}>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            aria-label="Notificações"
          >
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-brand-500 px-1 text-[10px] font-semibold leading-none text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>
        }
      />
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="border-b border-border px-3 py-2">
          <p className="text-sm font-semibold text-foreground">Notificações</p>
          <p className="text-xs text-muted-foreground">Aulas concluídas pelos alunos</p>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {items.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Nenhuma conclusão ainda.
            </p>
          ) : (
            items.map((i) => (
              <div
                key={i.id}
                className="flex flex-col gap-0.5 border-b border-border px-3 py-2 last:border-0"
              >
                <p className="text-sm text-foreground">
                  <span className="font-medium">{i.studentName}</span> concluiu{" "}
                  <span className="font-medium">{i.lessonTitle}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {i.courseTitle} · {mounted ? timeAgo(i.at) : ""}
                </p>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
