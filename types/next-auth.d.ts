import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}

// Auth.js v5 resolve o JWT via @auth/core/jwt — augmentar aqui também.
declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}
