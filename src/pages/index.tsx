import { useCallback, useState } from "react";
import type { InferGetServerSidePropsType } from "next";
import { createSSGHelpers } from "@trpc/react/ssg";
import { getOptionsForVote } from "@/utils/getRandomPokemon";
import { trpc } from "@/utils/trpc";
import { appRouter } from "@/backend/router";
import { inferQueryResponse } from "./api/trpc/[trpc]";
import Image from "next/future/image";
import Link from "next/link";
import React from "react";

const btn =
  "inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2, focus:ring-indigo-500";

type PokemonFromServer = inferQueryResponse<"get-pokemon-by-id">;

type PokemonListingLoading = {
  loading: true;
  pokemon?: unknown;
  vote?: undefined;
};
type PokemonListingLoaded = {
  loading?: false;
  pokemon: PokemonFromServer;
  vote: () => void;
};
type PokemonListingProps = PokemonListingLoading | PokemonListingLoaded;

const PokemonListing: React.FC<PokemonListingProps> = ({
  loading,
  pokemon,
  vote,
}) => {
  return (
    <div className="flex flex-col items-center">
      {loading ? (
        <Image width={256} height={256} src="/loading.svg" alt="loading" />
      ) : (
        <Image
          width={256}
          height={256}
          src={`/api/image/${pokemon.id}` || ""}
          alt={pokemon.name}
          priority
        />
      )}

      <div className="text-xl text-center pb-4 capitalize mt-[-2rem]">
        {loading ? "loading" : pokemon.name}
      </div>
      <button className={btn} onClick={vote} disabled={loading}>
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

  const firstPokemon = trpc.useQuery(["get-pokemon-by-id", { id: first }]);
  const secondPokemon = trpc.useQuery(["get-pokemon-by-id", { id: second }]);
  const voteMutation = trpc.useMutation(["cast-vote"]);

  // const image = trpc.useQuery(["get-pokemon-image", { id: firstId }]);
  // console.log(image);

  const dataLoaded = !!(
    !firstPokemon.isLoading &&
    firstPokemon.data &&
    !secondPokemon.isLoading &&
    secondPokemon.data
  );

  const voteForRoundest = useCallback(
    (selected: PokemonFromServer["id"]) => {
      if (selected === first) {
        voteMutation.mutate({ votedForId: first, votedAgainstId: second });
      } else voteMutation.mutate({ votedForId: second, votedAgainstId: first });

      updateIds(getOptionsForVote());
    },
    [first, second, voteMutation]
  );

  const voteFirst = useCallback(
    () => firstPokemon.data && voteForRoundest(firstPokemon.data.id),
    [firstPokemon.data, voteForRoundest]
  );
  const voteSecond = useCallback(
    () => secondPokemon.data && voteForRoundest(secondPokemon.data.id),
    [secondPokemon.data, voteForRoundest]
  );

  if (!firstPokemon || !secondPokemon) return null;
  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center gap-2">
      <div className="text-2xl text-center">Which Pokémon is rounder?</div>
      <div className="border rounded p-8 flex justify-between max-w-2xl items-center">
        {dataLoaded ? (
          <PokemonListing pokemon={firstPokemon.data} vote={voteFirst} />
        ) : (
          <PokemonListing loading />
        )}

        <div className="p-8">vs</div>

        {dataLoaded ? (
          <PokemonListing pokemon={secondPokemon.data} vote={voteSecond} />
        ) : (
          <PokemonListing loading />
        )}
      </div>

      <div className="absolute bottom-0 w-full text-xl text-center pb-2">
        <Link href="/results">Results(refresh every minute)</Link>
        {" | "}
        <a
          href="https://github.com/kabirsky/pokemon-survey"
          target={"_blank"}
          rel="noreferrer"
        >
          Github
        </a>
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
