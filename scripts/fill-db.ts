import { PokemonClient } from "pokenode-ts";
import { MAX_DEX_ID } from "../src/constants";
import { prisma } from "../src/backend/utils/prisma";

const doBackfill = async () => {
  const pokeApi = new PokemonClient();

  const allPokemon = await pokeApi.listPokemons(0, MAX_DEX_ID);

  const formattedPokemon = allPokemon.results.map((pokemon, index) => ({
    id: index + 1,
    name: pokemon.name,
    spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${
      index + 1
    }.png`,
  }));

  console.log("pokemon?", allPokemon);

  const creation = await prisma.pokemon.createMany({
    data: formattedPokemon,
  });

  console.log("Creation?", creation);
};

doBackfill();
