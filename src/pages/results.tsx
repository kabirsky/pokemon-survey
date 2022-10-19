import type { GetServerSideProps } from "next";
import { prisma } from "@/backend/utils/prisma";
import { AsyncReturnType } from "@/utils/ts-bs";
import Image from "next/future/image";
import Head from "next/head";

type PokemonQueryResult = AsyncReturnType<typeof getPokemonInOrder>;

const generateCountPercent = (pokemon: PokemonQueryResult[number]) => {
  const { votesFor, votesAgainst } = pokemon._count;
  if (votesFor + votesAgainst === 0) return 0;
  return (votesFor / (votesFor + votesAgainst)) * 100;
};

const PokemonListing: React.FC<{ pokemon: PokemonQueryResult[number] }> = ({
  pokemon,
}) => {
  return (
    <div className="flex border-b p-2 items-center justify-between">
      <div className="flex items-center">
        <Image
          src={pokemon.spriteUrl}
          alt={pokemon.name}
          width={64}
          height={64}
        />
        <div className="capitalize">{pokemon.name}</div>
      </div>
      <div className="pr-4">{generateCountPercent(pokemon) + "%"}</div>
    </div>
  );
};

const ResultsPage: React.FC<{
  pokemon: PokemonQueryResult;
}> = (props) => {
  return (
    <>
      <Head>
        <title>Results</title>
        <meta name="description" content="Pokémon roundness survey results" />
      </Head>

      <div className="flex flex-col items-center">
        <h2 className="text-2xl p-4">Results</h2>
        <div className="flex flex-col w-full max-w-2xl border">
          {props.pokemon.map((currentPokemon, index) => (
            <PokemonListing pokemon={currentPokemon} key={index} />
          ))}
        </div>
      </div>
    </>
  );
};
export default ResultsPage;

const getPokemonInOrder = async () => {
  return await prisma.pokemon.findMany({
    orderBy: { votesFor: { _count: "desc" } },
    select: {
      id: true,
      name: true,
      spriteUrl: true,
      _count: {
        select: {
          votesFor: true,
          votesAgainst: true,
        },
      },
    },
  });
};

export const getStaticProps: GetServerSideProps = async () => {
  const pokemonOrdered = await getPokemonInOrder();

  console.log("revalidating");

  return { props: { pokemon: pokemonOrdered }, revalidate: 60 };
};
