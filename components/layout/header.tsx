"use client";

import { useState } from "react";
import { Bell, Search, Brain } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { data: session } = useSession();
  const userName = session?.user?.name?.split(" ")[0] || "Usuário";

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div>
        {title ? (
          <>
            <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-gray-800">
              Olá, {userName}! 👋
            </h1>
            <p className="text-sm text-gray-500">Continue de onde parou</p>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Buscar..."
            className="bg-transparent border-none outline-none text-sm w-48"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Professor Virtual Button */}
        <Link
          href="/aluno/chat-ia"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/100 to-primary text-white rounded-xl hover:from-primary hover:to-primary transition-all shadow-md hover:shadow-lg"
        >
          <Brain size={18} />
          <span className="font-medium hidden sm:inline">Professor Virtual</span>
        </Link>
      </div>
    </header>
  );
}
