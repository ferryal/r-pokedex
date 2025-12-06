import { Fragment } from "react";
import { ChainLink, Pokemon } from "../hooks/usePokemonQueries";

import PokemonEvolution from "./PokemonEvolution";

type Props = {
  selectedIds: number[];
  chainLinks: ChainLink[];
  selectedBackgroundColor: { light: string; medium: string };
  pokemons: Pokemon[];
};

const PokemonDetailsEvolutions = ({
  selectedBackgroundColor,
  selectedIds,
  chainLinks,
  pokemons,
}: Props) => {
  return (
    <div className="mt-12 text-center ">
      <div className="lg:grid lg:grid-cols-2 lg:gap-y-10">
        {selectedIds.map((id) => {
          const pokemon = pokemons.find((p) => p !== null && id === p.id);
          const chain = chainLinks.find(
            ({ species }) =>
              Number(species.url.split("/").splice(-2)[0]) === pokemon?.id
          );

          return (
            <Fragment key={id}>
              {pokemon && (
                <PokemonEvolution
                  pokemon={pokemon}
                  chain={chain}
                  selectedBackgroundColor={selectedBackgroundColor}
                />
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default PokemonDetailsEvolutions;
