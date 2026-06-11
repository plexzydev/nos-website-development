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
    async signIn({ user, profile }) {
      if (profile && profile.id) {
        try {
          // Solo sincronizar el avatar si el usuario ya existe en la DB (fue linkeado por el bot)
          const existingUser = await db.query.users.findFirst({
            where: eq(users.id, profile.id as string)
          });

          if (existingUser) {
            const avatarUrl = (profile.image_url as string) || (user.image as string) || null;
            await db.update(users)
              .set({ avatarUrl })
              .where(eq(users.id, profile.id as string));
          }
          // Si el usuario NO existe en la DB, no hacemos nada.
          // El usuario debe usar /linkaccount en Discord primero.
        } catch (e) {
          console.error("Failed to sync avatar:", e);
        }
      }
    }
  }
})
