import {
  Award,
  BookOpen,
  Brain,
  ClipboardList,
  MessageSquare,
  Search,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  icon: LucideIcon;
  label: string;
  href: string;
  permission?: string;
};

export const menuItemsAluno: NavItem[] = [
  { icon: BookOpen, label: "Minhas Turmas", href: "/aluno/cursos" },
  { icon: ClipboardList, label: "Atividades", href: "/aluno/atividades" },
  { icon: MessageSquare, label: "Fórum", href: "/aluno/forum" },
  { icon: Brain, label: "Professor IA", href: "/aluno/tutor" },
  { icon: Search, label: "Busca", href: "/aluno/busca" },
  { icon: Award, label: "Certificados", href: "/aluno/certificados" },
];
