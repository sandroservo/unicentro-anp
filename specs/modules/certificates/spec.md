# Spec — Módulo Certificados (certificates)

**Fase:** 2 · **Depende de:** Cursos, Notas · **Status:** ✅ implementado (verificado)

## Objetivo

Emitir certificado de conclusão de curso; download em **PDF gerado on-the-fly**
(sem storage). Registro `Certificate` no banco (metadados).

## Schema

```prisma
model Certificate {
  id       String   @id @default(cuid()) // serve de código de validação
  userId   String
  courseId String
  issuedAt DateTime @default(now())
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  course   Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  @@unique([userId, courseId])
}
```

## PDF — `lib/certificate.ts`

`generateCertificatePdf({ studentName, courseName, code, dateStr })` → `Uint8Array` (pdf-lib).
Layout simples A4 paisagem: título, nome, curso, data, código. Puro/testável (bytes começam com `%PDF`).

## API

| POST | `/api/admin/courses/[id]/certificates` `{ userId }` | courses.write | emite (idempotente por @@unique) |
| GET | `/api/certificates/[id]/pdf` | sessão | baixa PDF |
| GET | `/api/aluno/certificates` | sessão | lista os certificados do próprio aluno |

## UI

- Admin: botão "Certificar" por aluno na página de Notas (emite).
- Aluno: `app/(dashboard)/aluno/certificados/page.tsx` — lista + botão baixar PDF.

## Verificação

- **Unit:** `generateCertificatePdf` retorna bytes `%PDF`.
- **Live:** admin emite certificado (201; 2ª vez idempotente/409); GET pdf → application/pdf;
  aluno lista os seus; sem sessão → 401.
