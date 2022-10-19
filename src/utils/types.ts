import { inferQueryResponse } from "@/pages/api/trpc/[trpc]";

export type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : any;

export type PokemonFromServer = inferQueryResponse<"get-pokemon-by-id">;
