import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible NextAuth configuration.
 * Must NOT import Mongoose, bcryptjs, or any Node.js native dependencies.
 * Used by Edge middleware for lightweight route protection and token reading.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      const isProtected =
        pathname.startsWith("/dashboard") ||
        pathname === "/listings/new" ||
        /^\/listings\/[^/]+\/edit/.test(pathname) ||
        pathname.startsWith("/favorites") ||
        pathname.startsWith("/enquiries") ||
        pathname.startsWith("/notifications") ||
        pathname.startsWith("/settings");

      if (isProtected) {
        if (isLoggedIn) return true;
        const callbackUrl = encodeURIComponent(pathname + nextUrl.search);
        return Response.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
      }

      const isAuthRoute = pathname === "/login" || pathname === "/register";
      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
      }
      if (trigger === "update" && session?.user) {
        token.name = session.user.name;
        token.image = session.user.image;
      }
      return token;
    },
    session({ session, token }) {
      if (token?.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;

