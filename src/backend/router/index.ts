import * as trpc from "@trpc/server";
import { z } from "zod";
import { prisma } from "@/backend/utils/prisma";

import { PokemonClient } from "pokenode-ts";
import { MAX_DEX_ID } from "@/constants";

export const appRouter = trpc
  .router()
  .query("get-pokemon-by-id", {
    input: z.object({ id: z.number() }),
    async resolve({ input }) {
      const api = new PokemonClient();

      const pokemon = await api.getPokemonById(input.id || 1);
      // return pokemon;
      return { id: pokemon.id, name: pokemon.name, sprites: pokemon.sprites };
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
