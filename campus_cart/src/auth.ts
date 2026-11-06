import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { loginSchema } from "@/features/auth/schemas";
import { env } from "@/lib/env";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    Google({
      clientId: env.AUTH_GOOGLE_ID || "placeholder-google-id",
      clientSecret: env.AUTH_GOOGLE_SECRET || "placeholder-google-secret",
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        await connectDB();
        const user = await User.findOne({ email }).lean();

        if (!user || !user.passwordHash) {
          return null;
        }

        const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordsMatch) {
          return null;
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image || null,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          if (!user.email) return false;

          await connectDB();
          const email = user.email.toLowerCase();
          const existingUser = await User.findOne({ email });

          if (!existingUser) {
            const newUser = await User.create({
              name: user.name || "Student",
              email,
              image: user.image || undefined,
              authProvider: "GOOGLE",
              contactPreference: "IN_APP",
              showPhone: false,
            });
            user.id = newUser._id.toString();
          } else {
            if (!existingUser.image && user.image) {
              existingUser.image = user.image;
              await existingUser.save();
            }
            user.id = existingUser._id.toString();
          }
          return true;
        } catch (error) {
          console.error("❌ Google signIn callback error:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user?.id) {
        token.id = user.id;
      }
      if (trigger === "update" && session?.user) {
        token.name = session.user.name;
        token.image = session.user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});

