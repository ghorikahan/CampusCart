import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

/**
 * Edge-compatible middleware.
 * Uses authConfig without any Mongoose, bcryptjs, or Node.js native dependencies.
 */
export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    /*
     * Match all protected routes and auth routes:
     * - /dashboard and subroutes
     * - /listings/new
     * - /listings/:id/edit
     * - /favorites and subroutes
     * - /enquiries and subroutes
     * - /notifications and subroutes
     * - /settings and subroutes
     * - /login & /register (for logged-in redirects)
     */
    "/dashboard/:path*",
    "/listings/new",
    "/listings/:id/edit",
    "/favorites/:path*",
    "/enquiries/:path*",
    "/notifications/:path*",
    "/settings/:path*",
    "/login",
    "/register",
  ],
};

