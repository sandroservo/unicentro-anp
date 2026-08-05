"use client";

import { useQuery } from "@tanstack/react-query";
import { Award, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type Cert = { id: string; issuedAt: string; course: { title: string } };

export function MyCertificates() {
  const { data: certs = [], isLoading } = useQuery({
    queryKey: ["my-certificates"],
    queryFn: async () => (await (await fetch("/api/aluno/certificates")).json()).certificates as Cert[],
  });

  if (isLoading) return <p className="text-gray-500">Carregando...</p>;
  if (certs.length === 0) return <p className="text-gray-500">Você ainda não tem certificados.</p>;

  return (
    <div className="grid gap-3 max-w-2xl">
      {certs.map((c) => (
        <div key={c.id} className="flex items-center gap-3 rounded-2xl border bg-card shadow-sm p-4">
          <Award className="h-8 w-8 text-yellow-500" />
          <div className="flex-1">
            <p className="font-medium">{c.course.title}</p>
            <p className="text-xs text-gray-500">
              Emitido em {new Date(c.issuedAt).toLocaleDateString("pt-BR")}
            </p>
          </div>
          <Button variant="outline" size="sm" nativeButton={false} render={
            <a href={`/api/certificates/${c.id}/pdf`} target="_blank" rel="noreferrer">
              <Download className="h-4 w-4" /> PDF
            </a>
          } />
        </div>
      ))}
    </div>
  );
}
