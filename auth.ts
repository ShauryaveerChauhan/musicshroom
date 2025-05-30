
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prismaClient } from "./app/lib/db";
export const {handlers,auth,signIn,signOut} = NextAuth({
  adapter: PrismaAdapter(prismaClient),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email, 
          image: profile.picture,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET ?? "secret",
  callbacks: {
    async signIn(params) {
      if (!params.user.email) {
        return false;
      }

      try {
        await prismaClient.user.create({
          data: {
            email: params.user.email,
            provider: "Google"
          }
        })
      } catch(e) {

      }
      return true
    }
  }
});
