import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role;
    const isAdmin = role === "ADMIN" || role === "SUPER";
    if (pathname.startsWith("/admin") && !isAdmin) {
      return NextResponse.redirect(new URL("/aluno", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: { authorized: ({ token }) => !!token },
    pages: { signIn: "/login" },
  }
);

export const config = {
  matcher: ["/aluno/:path*", "/admin/:path*"],
};
