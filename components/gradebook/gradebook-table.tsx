"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";

type Activity = { id: string; title: string };
type Row = { userId: string; name: string; grades: Record<string, number | null>; average: number };
type Data = { activities: Activity[]; rows: Row[] };

export function GradebookTable({ courseId, canWrite }: { courseId: string; canWrite: boolean }) {
  const { data, isLoading } = useQuery({
    queryKey: ["gradebook", courseId],
    queryFn: async () => (await (await fetch(`/api/admin/courses/${courseId}/gradebook`)).json()) as Data,
  });

  const issue = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/admin/courses/${courseId}/certificates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Erro");
    },
    onSuccess: () => toast.success("Certificado emitido"),
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading || !data) return <p className="text-muted-foreground">Carregando...</p>;
  if (data.activities.length === 0) return <p className="text-muted-foreground">Nenhuma atividade neste curso.</p>;
  if (data.rows.length === 0) return <p className="text-muted-foreground">Nenhuma submissão ainda.</p>;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="sticky left-0 bg-white dark:bg-gray-900">Aluno</TableHead>
            {data.activities.map((a) => (
              <TableHead key={a.id} className="whitespace-nowrap">{a.title}</TableHead>
            ))}
            <TableHead>Média</TableHead>
            {canWrite && <TableHead className="text-right">Certificado</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.rows.map((r) => (
            <TableRow key={r.userId}>
              <TableCell className="font-medium sticky left-0 bg-white dark:bg-gray-900">{r.name}</TableCell>
              {data.activities.map((a) => (
                <TableCell key={a.id}>{r.grades[a.id] ?? "—"}</TableCell>
              ))}
              <TableCell className="font-semibold">{r.average}</TableCell>
              {canWrite && (
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => issue.mutate(r.userId)} disabled={issue.isPending}>
                    <Award className="h-4 w-4" /> Certificar
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
