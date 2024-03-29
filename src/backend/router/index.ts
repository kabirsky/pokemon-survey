import * as trpc from "@trpc/server";
import { z } from "zod";
import { prisma } from "@/backend/utils/prisma";

import { PokemonClient } from "pokenode-ts";
import { MAX_DEX_ID } from "@/constants";

export const appRouter = trpc
  .router()
  .query("get-pokemon-by-id", {
    input: z.object({ id: z.number().max(MAX_DEX_ID) }),
    async resolve({ input }) {
      const pokemon = await prisma.pokemon.findFirst({
        where: { id: input.id },
      });

      if (!pokemon) throw new Error("welp get fucked");

      return pokemon;
    },
  })
  .mutation("cast-vote", {
    input: z.object({
      votedForId: z.number().max(MAX_DEX_ID),
      votedAgainstId: z.number().max(MAX_DEX_ID),
    }),
    async resolve({ input }) {
      const voteInDb = await prisma.vote.create({
        data: {
          ...input,
        },
      });
      return { success: true, vote: voteInDb };
    },
  });

// export type definition of API
export type AppRouter = typeof appRouter;
