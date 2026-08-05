"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";

type Activity = { id: string; title: string };
type Row = { userId: string; name: string; grades: Record<string, number | null>; average: number };
type Data = { activities: Activity[]; rows: Row[] };

export function GradebookTable({ courseId }: { courseId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["gradebook", courseId],
    queryFn: async () => (await (await fetch(`/api/admin/courses/${courseId}/gradebook`)).json()) as Data,
  });

  if (isLoading || !data) return <p className="text-gray-500">Carregando...</p>;
  if (data.activities.length === 0) return <p className="text-gray-500">Nenhuma atividade neste curso.</p>;
  if (data.rows.length === 0) return <p className="text-gray-500">Nenhuma submissão ainda.</p>;

  return (
    <div className="rounded-lg border bg-white overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="sticky left-0 bg-white">Aluno</TableHead>
            {data.activities.map((a) => (
              <TableHead key={a.id} className="whitespace-nowrap">{a.title}</TableHead>
            ))}
            <TableHead>Média</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.rows.map((r) => (
            <TableRow key={r.userId}>
              <TableCell className="font-medium sticky left-0 bg-white">{r.name}</TableCell>
              {data.activities.map((a) => (
                <TableCell key={a.id}>{r.grades[a.id] ?? "—"}</TableCell>
              ))}
              <TableCell className="font-semibold">{r.average}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
