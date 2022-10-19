import { PokemonFromServer } from "@/utils/types";
import Image from "next/future/image";
import Button from "../Button";

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
      <Button onClick={vote}>Rounder</Button>
    </div>
  );
};

export default PokemonListing;
