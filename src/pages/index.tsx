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
import ImagePreload from "@/components/ImagePreload";
import Head from "next/head";
import VoteForm from "@/components/VoteForm";
import { PokemonFromServer } from "@/utils/types";

const Home = ({
  current,
  next,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [currentPokemons, updateIds] = useState<[number, number]>([
    current.firstId,
    current.secondId,
  ]);
  const [nextPokemons, updateNextIds] = useState<[number, number]>([
    next.firstId,
    next.secondId,
  ]);

  const firstPokemon = trpc.useQuery([
    "get-pokemon-by-id",
    { id: currentPokemons[0] },
  ]);
  const secondPokemon = trpc.useQuery([
    "get-pokemon-by-id",
    { id: currentPokemons[1] },
  ]);
  trpc.useQuery(["get-pokemon-by-id", { id: nextPokemons[0] }]);
  trpc.useQuery(["get-pokemon-by-id", { id: nextPokemons[1] }]);

  const voteMutation = trpc.useMutation(["cast-vote"]);

  const dataLoaded = !!(
    !firstPokemon.isLoading &&
    firstPokemon.data &&
    !secondPokemon.isLoading &&
    secondPokemon.data
  );

  const voteForRoundest = useCallback(
    (selected: PokemonFromServer["id"]) => {
      if (selected === currentPokemons[0]) {
        voteMutation.mutate({
          votedForId: currentPokemons[0],
          votedAgainstId: currentPokemons[1],
        });
      } else
        voteMutation.mutate({
          votedForId: currentPokemons[1],
          votedAgainstId: currentPokemons[0],
        });

      updateIds(nextPokemons);
      updateNextIds(getOptionsForVote());
    },
    [currentPokemons, nextPokemons, voteMutation]
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
    <>
      <Head>
        <title>Which Pokémon is rounder?</title>
        <meta
          name="description"
          content="Quite useless survey about roundness of pokémons"
        />
      </Head>

      <ImagePreload images={nextPokemons} />

      <div className="h-screen w-screen flex flex-col justify-center items-center gap-2">
        <div className="text-2xl text-center">Which Pokémon is rounder?</div>

        {dataLoaded ? (
          <VoteForm
            data={[firstPokemon.data, secondPokemon.data]}
            voteFor={[voteFirst, voteSecond]}
          />
        ) : (
          <VoteForm loading />
        )}

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
    </>
  );
};

export const getServerSideProps = async () => {
  const ssg = await createSSGHelpers({
    router: appRouter,
    ctx: {},
  });

  const [firstId, secondId] = getOptionsForVote();
  const [nextFirstId, nextSecondId] = getOptionsForVote();

  await ssg.fetchQuery("get-pokemon-by-id", { id: firstId });
  await ssg.fetchQuery("get-pokemon-by-id", { id: secondId });

  await ssg.fetchQuery("get-pokemon-by-id", { id: nextFirstId });
  await ssg.fetchQuery("get-pokemon-by-id", { id: nextSecondId });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      current: {
        firstId,
        secondId,
      },
      next: {
        firstId: nextFirstId,
        secondId: nextSecondId,
      },
    },
  };
};

export default Home;
