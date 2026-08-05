// RBAC — fonte única de roles, permissões e matriz. Puro (sem Prisma) para ser
// importável no edge (middleware/auth.config) e no seed/authorize (node).

export const PERMISSIONS = [
  "students.read",
  "students.write",
  "courses.read",
  "courses.write",
  "subjects.write",
  "lessons.write",
  "youtube.manage",
  "questions.write",
  "users.manage",
  "settings.manage",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export type RoleSlug =
  | "SUPER_ADMIN"
  | "ADMINISTRADOR"
  | "COORDENADOR"
  | "TUTOR"
  | "PROFESSOR"
  | "ALUNO";

export interface RoleDef {
  slug: RoleSlug;
  name: string;
  permissions: Permission[];
}

const ALL: Permission[] = [...PERMISSIONS];

export const ROLES: RoleDef[] = [
  { slug: "SUPER_ADMIN", name: "SuperAdmin", permissions: ALL },
  { slug: "ADMINISTRADOR", name: "Administrador", permissions: ALL },
  {
    slug: "COORDENADOR",
    name: "Coordenador",
    permissions: [
      "students.read",
      "students.write",
      "courses.read",
      "courses.write",
      "subjects.write",
      "lessons.write",
      "youtube.manage",
      "questions.write",
    ],
  },
  {
    slug: "PROFESSOR",
    name: "Professor",
    permissions: ["courses.read", "lessons.write", "youtube.manage", "students.read", "questions.write"],
  },
  { slug: "TUTOR", name: "Tutor", permissions: ["students.read", "courses.read"] },
  { slug: "ALUNO", name: "Aluno", permissions: [] },
];

// Roles que podem acessar a área /admin (gate grosso no middleware).
export const ADMIN_ROLE_SLUGS: RoleSlug[] = ["SUPER_ADMIN", "ADMINISTRADOR"];

// Backfill do campo String legado (User.role) -> slug novo.
export const LEGACY_ROLE_MAP: Record<string, RoleSlug> = {
  STUDENT: "ALUNO",
  TEACHER: "PROFESSOR",
  ADMIN: "ADMINISTRADOR",
  SUPER: "SUPER_ADMIN",
  MONITOR: "TUTOR",
};

// Mapeia um valor de role (slug novo OU string legada) para o slug canônico.
export function toRoleSlug(role: string | null | undefined): RoleSlug {
  if (!role) return "ALUNO";
  const upper = role.toUpperCase();
  if (upper in LEGACY_ROLE_MAP) return LEGACY_ROLE_MAP[upper];
  const known = ROLES.find((r) => r.slug === upper);
  return known ? known.slug : "ALUNO";
}

export function isAdminRole(slug: string | null | undefined): boolean {
  return !!slug && (ADMIN_ROLE_SLUGS as string[]).includes(slug);
}
