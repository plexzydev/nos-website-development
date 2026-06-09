import NextAuth from "next-auth"
import Discord from "next-auth/providers/discord"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      authorization: "https://discord.com/api/oauth2/authorize?scope=identify+guilds.members.read",
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async jwt({ token, profile }) {
      if (profile) {
        token.id = profile.id;
      }
      return token;
    }
  },
  events: {
    async signIn({ user, account, profile }) {
      if (profile && profile.id) {
        // Sync avatar on sign in
        try {
          await db.update(users)
            .set({ avatarUrl: profile.image_url as string || user.image })
            .where(eq(users.id, profile.id as string));
        } catch (e) {
          console.error("Failed to sync avatar:", e);
        }
      }
    }
  }
})
