import { useState, useMemo, useEffect } from "react";
import PokemonForm from "../components/PokemonForm";
import Layout from "../components/Layout";
import PokemonCard from "../components/PokemonCard";
import { useAppSelector } from "../features/hooks";
import { SliceStatus } from "../globals";
import { cachedPokemonsSelector } from "../features/cachedPokemonsSlice";
import PokemonSkeleton from "../components/PokemonSkeleton";
import { usePokemonList, usePokemons } from "../hooks/usePokemonQueries";
import LoadButton from "../components/LoadButton";
import { Waypoint as ReactWaypoint } from "react-waypoint";

const PAGINATE_SIZE = 6;

const PokemonsPage = () => {
  const cachedPokemons = useAppSelector(cachedPokemonsSelector);
  const [page, setPage] = useState(PAGINATE_SIZE);

  // Get the pokemon list (names and URLs)
  const { data: pokemonList } = usePokemonList(809);

  // Calculate which Pokemon IDs to fetch based on current page
  const pokemonIdsToFetch = useMemo(() => {
    if (!pokemonList?.results) return [];

    // Use filtered cached pokemons if available, otherwise use all
    const dataSource =
      cachedPokemons.data.length > 0
        ? cachedPokemons.data
        : pokemonList.results;

    return dataSource
      .slice(0, page)
      .map((pokemon) => Number(pokemon.url.split("/").slice(-2)[0]));
  }, [pokemonList, page, cachedPokemons.data]);

  // Fetch the actual pokemon data
  const pokemonQueries = usePokemons(pokemonIdsToFetch);
  const pokemons = pokemonQueries
    .map((query) => query.data)
    .filter((data) => data != null);

  const isLoading = pokemonQueries.some((query) => query.isLoading);

  // Calculate how many skeleton cards to show
  const loadedCount = pokemons.length;
  const expectedCount = pokemonIdsToFetch.length;
  const skeletonCount = expectedCount - loadedCount;

  // Reset page when cached pokemons change (search/filter)
  useEffect(() => {
    setPage(PAGINATE_SIZE);
  }, [cachedPokemons.data]);

  const handleLoadMore = () => {
    setPage((prev) => prev + PAGINATE_SIZE);
  };

  return (
    <Layout title="Home">
      <div className="flex items-center justify-center lg:justify-start">
        <h1 className="text-3xl lg:text-5xl font-semibold sm:text-left inline-block">
          React Vite Pokédex
        </h1>
      </div>

      <div className="my-4 md:my-6 lg:my-8 w-full">
        <PokemonForm
          placeholder="Search for a pokémon..."
          mutatePage={setPage}
        />
      </div>

      <div className="mx-auto w-full text-center">
        {!(
          cachedPokemons.status.state === SliceStatus.LOADING ||
          cachedPokemons.status.state === SliceStatus.IDLE
        ) && (
          <>
            <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 lg:gap-x-5 gap-y-6">
              {/* Show loaded Pokemon cards */}
              {pokemons.map((pokemon) => (
                <PokemonCard key={pokemon.id} {...pokemon} />
              ))}

              {/* Show skeleton cards for loading items */}
              {isLoading &&
                skeletonCount > 0 &&
                Array.from({ length: skeletonCount }).map((_, index) => (
                  <PokemonSkeleton key={`loading-${loadedCount + index}`} />
                ))}
            </div>

            {/* Waypoint for infinite scroll */}
            <div className="mt-48">
              {!isLoading &&
                page <
                  (cachedPokemons.data.length > 0
                    ? cachedPokemons.data.length
                    : pokemonList?.results.length || 0) && (
                  <ReactWaypoint onEnter={handleLoadMore} />
                )}
            </div>

            {/* Load More Button */}
            <div className="py-16 mx-auto">
              {!isLoading &&
                page <
                  (cachedPokemons.data.length > 0
                    ? cachedPokemons.data.length
                    : pokemonList?.results.length || 0) && (
                  <div className="mt-6">
                    <LoadButton clickHandler={handleLoadMore} />
                  </div>
                )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};
export default PokemonsPage;
