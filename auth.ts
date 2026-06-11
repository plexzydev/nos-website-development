import NextAuth from "next-auth"
import Discord from "next-auth/providers/discord"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

const MECHANIC_ROLE_ID = '1478275468666077205';
const ADMIN_ROLE_ID = '1478286207447339060';

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
        try {
          // Get member data from Discord to check roles
          let isMechanic = false;
          let isAdmin = false;
          const nickname = profile.global_name || profile.username;

          try {
            const res = await fetch(`https://discord.com/api/v10/guilds/${process.env.DISCORD_GUILD_ID}/members/${profile.id}`, {
              headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
            });

            if (res.ok) {
              const member = await res.json();
              isMechanic = member.roles.includes(MECHANIC_ROLE_ID);
              isAdmin = member.roles.includes(ADMIN_ROLE_ID);
            }
          } catch (err) {
            console.error("Failed to fetch Discord member roles:", err);
          }

          // Upsert user (insert if not exists, update if exists)
          const existingUser = await db.query.users.findFirst({
            where: eq(users.id, profile.id as string)
          });

          if (existingUser) {
            await db.update(users)
              .set({
                avatarUrl: profile.image_url as string || user.image,
                isMechanic,
                isAdmin,
                nickname
              })
              .where(eq(users.id, profile.id as string));
          } else {
            await db.insert(users).values({
              id: profile.id as string,
              avatarUrl: profile.image_url as string || user.image,
              isMechanic,
              isAdmin,
              nickname
            });
          }
        } catch (e) {
          console.error("Failed to sync user data:", e);
        }
      }
    }
  }
})
