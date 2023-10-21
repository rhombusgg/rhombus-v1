import { z } from "zod";

import { bot } from "./bot";
import { generateInviteToken } from "./nextauth";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "./trpc";

export const appRouter = createTRPCRouter({
  rerollInviteToken: protectedProcedure.mutation(async ({ ctx }) => {
    const t = await ctx.db.team.findFirst({
      where: { id: ctx.session.user.teamId },
    });

    if (ctx.session.user.id !== t?.ownerId)
      throw new Error("Your are not the onwer of this team!");

    const team = await ctx.db.team.update({
      where: { id: t?.id },
      data: {
        inviteToken: generateInviteToken(),
      },
    });

    return team.inviteToken;
  }),

  kickUser: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const team = await ctx.db.team.findUnique({
        where: { id: ctx.session.user.teamId },
        select: {
          id: true,
          ownerId: true,
          users: {
            select: { id: true, ownerTeamId: true, name: true, email: true },
          },
        },
      });
      if (!team) return;

      if (ctx.session.user.id !== team.ownerId)
        throw new Error("Your are not the onwer of this team!");

      const userToKick = team.users.find((user) => user.id === input.userId);

      if (!userToKick) throw new Error("User is not in your team!");

      await ctx.db.team.update({
        where: { id: userToKick.ownerTeamId! },
        data: { users: { connect: { id: userToKick.id } } },
      });
    }),

  updateTeamName: protectedProcedure
    .input(z.object({ name: z.string().min(3).max(50) }))
    .mutation(async ({ ctx, input }) => {
      const team = await ctx.db.team.findFirst({
        where: { id: ctx.session.user.teamId },
      });

      if (ctx.session.user.id !== team?.ownerId)
        throw new Error("Your are not the onwer of this team!");

      await ctx.db.team.update({
        where: { id: team?.id },
        data: {
          name: input.name,
        },
      });
    }),

  userInServer: protectedProcedure.query(async ({ ctx }) => {
    const discordId = ctx.session.user.discordId;
    if (!discordId) return false;

    return await bot.userInServer.query({
      discordId: discordId,
    });
  }),
});

export type AppRouter = typeof appRouter;
