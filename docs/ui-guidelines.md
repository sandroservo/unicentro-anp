# UI Guidelines — ANP LMS

> Stub. Consolidado após o módulo Alunos (primeiro CRUD, define o padrão).

- **Design system**: shadcn/ui sobre TailwindCSS. `cn()` de `lib/utils.ts`.
- **Idioma**: PT-BR em toda a UI.
- **Padrão CRUD**: tabela (shadcn `table`) + dialog de create/edit (RHF) + toast (`sonner`) no sucesso/erro.
- **Ícones**: `lucide-react`.
- **Layout**: sidebar por role (`components/layout/sidebar.tsx`), header comum.
- **Acessibilidade**: labels em todo input, foco visível, navegação por teclado nos dialogs.
