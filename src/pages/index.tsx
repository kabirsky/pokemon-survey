import { createSSGHelpers } from "@trpc/react/ssg";
import { getOptionsForVote } from "@/utils/getRandomPokemon";
import { trpc } from "@/utils/trpc";
import { appRouter } from "@/backend/router";
import type { InferGetServerSidePropsType } from "next";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";

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

const Home = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  const { firstId, secondId } = props;
  const { data: firstPokemon } = trpc.useQuery([
    "get-pokemon-by-id",
    { id: firstId },
  ]);
  const { data: secondPokemon } = trpc.useQuery([
    "get-pokemon-by-id",
    { id: secondId },
  ]);
  console.log(firstPokemon);

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center gap-2">
      <div className="text-2xl text-center">Which Pokémon is rounder?</div>
      <div className="border rounded p-8 flex justify-between max-w-2xl items-center">
        <div className="w-16 h-16 bg-red-800">
          {firstPokemon && capitalizeFirstLetter(firstPokemon.name)}
        </div>
        <div className="p-8">vs</div>
        <div className="w-16 h-16 bg-red-800">
          {secondPokemon && capitalizeFirstLetter(secondPokemon.name)}
        </div>
      </div>
    </div>
  );
};

export default Home;
