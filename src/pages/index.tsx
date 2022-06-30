import { createSSGHelpers } from "@trpc/react/ssg";
import { getOptionsForVote } from "@/utils/getRandomPokemon";
import { trpc } from "@/utils/trpc";
import { appRouter } from "@/backend/router";
import type { InferGetServerSidePropsType } from "next";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";

const btn =
  "inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2, focus:ring-indigo-500";

const Home = ({
  firstId,
  secondId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { data: firstPokemon } = trpc.useQuery([
    "get-pokemon-by-id",
    { id: firstId },
  ]);
  const { data: secondPokemon } = trpc.useQuery([
    "get-pokemon-by-id",
    { id: secondId },
  ]);

  if (!firstPokemon || !secondPokemon) return null;

  const voteForRoundest = (selected: number) => {
    // updateIds()
  };

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center gap-2">
      <div className="text-2xl text-center">Which Pokémon is rounder?</div>
      <div className="border rounded p-8 flex justify-between max-w-2xl items-center">
        <div className="w-64 flex flex-col items-center">
          <img className="w-full " src={firstPokemon.sprites.front_default} />
          <div className="text-xl text-center pb-4 capitalize mt-[-2rem]">
            {firstPokemon.name}
          </div>
          <button className={btn}>Rounder</button>
        </div>

        <div className="p-8">vs</div>

        <div className="w-64 flex flex-col items-center">
          <img className="w-full" src={secondPokemon.sprites.front_default} />
          <div className="text-xl text-center pb-4 capitalize mt-[-2rem]">
            {secondPokemon.name}
          </div>
          <button className={btn}>Rounder</button>
        </div>
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
