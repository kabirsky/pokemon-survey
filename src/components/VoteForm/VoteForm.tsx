import { PokemonFromServer } from "@/utils/types";
import PokemonListing from "../PokemonListing";

const VoteForm: React.FC<
  | {
      loading?: false;
      data: [PokemonFromServer, PokemonFromServer];
      voteFor: [() => void, () => void];
    }
  | {
      loading: true;
      data?: unknown;
      voteFor?: unknown;
    }
> = ({ loading, data, voteFor }) => {
  return (
    <div className="border rounded p-8 flex flex-col md:flex-row justify-between max-w-2xl items-center">
      {loading ? (
        <>
          <PokemonListing loading />
          <div className="p-8 hidden md:block">vs</div>
          <PokemonListing loading />
        </>
      ) : (
        <>
          <PokemonListing pokemon={data[0]} vote={voteFor[0]} />
          <div className="p-8 hidden md:block">vs</div>
          <PokemonListing pokemon={data[1]} vote={voteFor[1]} />
        </>
      )}
    </div>
  );
};

export default VoteForm;
