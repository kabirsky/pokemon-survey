import { useState } from "react";
import type { InferGetServerSidePropsType } from "next";
import { createSSGHelpers } from "@trpc/react/ssg";
import { getOptionsForVote } from "@/utils/getRandomPokemon";
import { trpc } from "@/utils/trpc";
import { appRouter } from "@/backend/router";
import { inferQueryResponse } from "./api/trpc/[trpc]";
import Image from "next/future/image";

const btn =
  "inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2, focus:ring-indigo-500";

type PokemonFromServer = inferQueryResponse<"get-pokemon-by-id">;

const PokemonListing: React.FC<{
  pokemon: PokemonFromServer;
  vote: () => void;
}> = ({ pokemon, vote }) => {
  return (
    <div className="flex flex-col items-center">
      <Image
        width={256}
        height={256}
        src={pokemon.sprites.front_default || ""}
        alt={pokemon.name}
      />
      <div className="text-xl text-center pb-4 capitalize mt-[-2rem]">
        {pokemon.name}
      </div>
      <button className={btn} onClick={vote}>
        Rounder
      </button>
    </div>
  );
};

const Home = ({
  firstId,
  secondId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [[first, second], updateIds] = useState([firstId, secondId]);

  const { data: firstPokemon } = trpc.useQuery([
    "get-pokemon-by-id",
    { id: first },
  ]);
  const { data: secondPokemon } = trpc.useQuery([
    "get-pokemon-by-id",
    { id: second },
  ]);
  const voteMutation = trpc.useMutation(["cast-vote"]);

  if (!firstPokemon || !secondPokemon) return null;

  const voteForRoundest = (selected: PokemonFromServer["id"]) => {
    if (selected === first) {
      voteMutation.mutate({ votedForId: first, votedAgainstId: second });
    } else voteMutation.mutate({ votedForId: second, votedAgainstId: first });

    updateIds(getOptionsForVote());
  };

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center gap-2">
      <div className="text-2xl text-center">Which Pokémon is rounder?</div>
      <div className="border rounded p-8 flex justify-between max-w-2xl items-center">
        <PokemonListing
          pokemon={firstPokemon}
          vote={() => voteForRoundest(firstPokemon.id)}
        />

        <div className="p-8">vs</div>

        <PokemonListing
          pokemon={secondPokemon}
          vote={() => voteForRoundest(secondPokemon.id)}
        />
      </div>
    </div>
  );
};

export const getServerSideProps = async () => {
  const ssg = await createSSGHelpers({
    router: appRouter,
    ctx: {},
  });

  const [firstId, secondId] = getOptionsForVote();

  await ssg.fetchQuery("get-pokemon-by-id", { id: firstId });
  await ssg.fetchQuery("get-pokemon-by-id", { id: secondId });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      firstId,
      secondId,
    },
  };
};

export default Home;
