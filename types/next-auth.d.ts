import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string; // slug canônico (SUPER_ADMIN, ALUNO, ...)
      permissions: string[];
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    permissions: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    permissions: string[];
  }
}

// Auth.js v5 resolve o JWT via @auth/core/jwt — augmentar aqui também.
declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: string;
    permissions: string[];
  }
}
