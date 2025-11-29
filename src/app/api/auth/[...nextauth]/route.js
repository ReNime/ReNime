import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions = {
  session: {
    strategy: "jwt",
  },

  providers: [
    // OAUTH GOOGLE
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    // LOGIN WA + PASSWORD
    CredentialsProvider({
      name: "Phone Login",
      credentials: {
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        const { phone, password } = credentials;

        const user = await prisma.user.findUnique({
          where: { phone },
        });

        if (!user) return null;

        const check = await bcrypt.compare(password, user.password);
        if (!check) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.phone = user.phone;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.phone = token.phone;
      return session;
    },
  },

  pages: {
    signIn: "/login", // custom login page
  },
};

//const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
