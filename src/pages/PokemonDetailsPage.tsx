import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import PokemonDetailsBiography from "../components/PokemonDetailsBiography";
import PokemonDetailsEvolutions from "../components/PokemonDetailsEvolutions";
import PokemonDetailsHeader from "../components/PokemonDetailsHeader";
import PokemonDetailsStats from "../components/PokemonDetailsStats";
import Tab from "../components/Tab";
import { PokemonTypeColors } from "../globals";
import { ScaleLoader } from "react-spinners";
import { useTransition, animated } from "react-spring";
import { capitalize } from "../utils/capitalize";
import {
  usePokemon,
  useSpecies,
  useEvolutionChain,
  usePokemons,
  ChainLink,
} from "../hooks/usePokemonQueries";

type PokemonTabs = "biography" | "stats" | "evolutions";

const PokemonDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<PokemonTabs>("biography");
  const transitions = useTransition(activeTab, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: {
      duration: 250,
    },
  });

  // Queries
  const { data: selectedPokemon, isLoading: isPokemonLoading } = usePokemon(
    id || ""
  );
  const { data: selectedSpecies, isLoading: isSpeciesLoading } = useSpecies(
    id || ""
  );

  const evolutionChainId = selectedSpecies?.evolutionChain?.url
    .split("/")
    .slice(-2)[0];

  const { data: selectedEvolutionChain, isLoading: isEvolutionLoading } =
    useEvolutionChain(evolutionChainId || "");

  const [chainLinks, setChainLinks] = useState<ChainLink[]>([]);
  const [selectedEvolutionPokemonIds, setSelectedEvolutionPokemonIds] =
    useState<number[]>([]);

  const getPokemonEvolution = useCallback(
    (chain: ChainLink | null): ChainLink[] => {
      if (!chain) {
        return [];
      } else {
        return [chain].concat(getPokemonEvolution(chain.evolvesTo[0]));
      }
    },
    []
  );

  useEffect(() => {
    if (selectedEvolutionChain?.chain) {
      const pokemons: ChainLink[] = getPokemonEvolution(
        selectedEvolutionChain.chain
      );
      const pokemonIds = pokemons.map(({ species }) =>
        Number(species.url.split("/").slice(-2)[0])
      );
      setSelectedEvolutionPokemonIds(pokemonIds);
      setChainLinks(pokemons);
    }
    //eslint-disable-next-line
  }, [selectedEvolutionChain]);

  // Fetch evolution pokemons
  const evolutionPokemonsQueries = usePokemons(selectedEvolutionPokemonIds);
  const evolutionPokemons = evolutionPokemonsQueries
    .map((query) => query.data)
    .filter((data) => data != null);

  const backgroundColors = selectedPokemon?.types.map(({ type }) => {
    const [[, backgroundColor]] = Object.entries(PokemonTypeColors).filter(
      ([key, _]) => key === type.name
    );

    return backgroundColor;
  });

  const selectedBackgroundColor = backgroundColors && backgroundColors[0];

  const isPageLoading =
    isPokemonLoading || isSpeciesLoading || isEvolutionLoading;

  return (
    <Layout title={capitalize(selectedPokemon?.name)}>
      {isPageLoading ? (
        <div className="text-center mx-auto mt-12">
          <ScaleLoader color="#E3350D" radius={16} />
        </div>
      ) : (
        <>
          <>
            {selectedPokemon &&
              selectedSpecies &&
              selectedBackgroundColor &&
              selectedEvolutionChain && (
                <div className="pb-8">
                  <button
                    className="text-primary font-semibold transform hover:-translate-y-1 transition-transform ease-in duration-150 focus:outline-none"
                    onClick={() => navigate("/")}
                  >
                    <span className="text-primary font-semibold">Go Back</span>
                  </button>
                  <div
                    className="flex flex-col lg:flex-row justify-center items-start w-full mx-auto my-4 rounded-lg shadow-lg"
                    style={{
                      backgroundColor:
                        selectedBackgroundColor &&
                        selectedBackgroundColor.medium,
                    }}
                  >
                    <PokemonDetailsHeader
                      pokemon={selectedPokemon}
                      species={selectedSpecies}
                      selectedBackgroundColor={selectedBackgroundColor}
                    />
                    <div className="bg-white lg:mt-0 rounded-t-3xl rounded-b-lg lg:rounded-t-none lg:rounded-b-none lg:rounded-r-lg overflow-hidden w-full pt-16 lg:pt-8 px-6 md:px-12 lg:px-24">
                      <div className="flex flex-row justify-between w-full">
                        <Tab
                          handleSelect={() => setActiveTab("biography")}
                          isSelected={activeTab === "biography"}
                        >
                          Biography
                        </Tab>
                        <Tab
                          handleSelect={() => setActiveTab("stats")}
                          isSelected={activeTab === "stats"}
                        >
                          Stats
                        </Tab>
                        <Tab
                          handleSelect={() => setActiveTab("evolutions")}
                          isSelected={activeTab === "evolutions"}
                        >
                          Evolutions
                        </Tab>
                      </div>
                      <div className="relative mt-8 lg:h-178">
                        {transitions((props, item) => {
                          let page: JSX.Element = (
                            <PokemonDetailsBiography
                              species={selectedSpecies}
                              pokemon={selectedPokemon}
                            />
                          );

                          switch (item) {
                            case "biography":
                              page = (
                                <PokemonDetailsBiography
                                  species={selectedSpecies}
                                  pokemon={selectedPokemon}
                                />
                              );
                              break;
                            case "stats":
                              page = (
                                <PokemonDetailsStats
                                  pokemon={selectedPokemon}
                                />
                              );
                              break;
                            case "evolutions":
                              page = (
                                <PokemonDetailsEvolutions
                                  selectedIds={selectedEvolutionPokemonIds}
                                  chainLinks={chainLinks}
                                  selectedBackgroundColor={
                                    selectedBackgroundColor
                                  }
                                  pokemons={evolutionPokemons}
                                />
                              );
                              break;
                            default:
                              break;
                          }
                          return (
                            <animated.div
                              style={{
                                ...props,
                                position: "relative",
                                width: "100%",
                                height: "100%",
                              }}
                            >
                              {page}
                            </animated.div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </>
        </>
      )}
    </Layout>
  );
};
export default PokemonDetailsPage;
