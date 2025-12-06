import { useQuery, useQueries } from "@tanstack/react-query";
import fromApi from "../api/fromApi";
import { camelcaseObject } from "../utils/camelcaseObject";
import { transformSpriteToBaseImage } from "../features/utilities";
import { baseImageUrl } from "../api/axios";

// Types
export interface NamedAPIResource {
  name: string;
  url: string;
}

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  baseExperience: number;
  abilities: Array<{
    ability: {
      name: string;
      url: string;
    };
    isHidden: boolean;
  }>;
  sprites: {
    frontDefault: string;
  };
  types: Array<{
    type: {
      name: string;
      url: string;
    };
  }>;
  stats: Array<{
    baseStat: number;
    stat: {
      name: string;
    };
  }>;
}

export interface Species {
  id: number;
  name: string;
  genderRate: number;
  captureRate: number;
  baseHappiness: number;
  flavorTextEntries: Array<{
    flavorText: string;
    language: {
      name: string;
    };
  }>;
  genera: Array<{
    genus: string;
    language: {
      name: string;
    };
  }>;
  names: Array<{
    name: string;
    language: {
      name: string;
    };
  }>;
  growthRate: {
    name: string;
  };
  evolutionChain: {
    url: string;
  };
}

export interface ChainLink {
  species: {
    name: string;
    url: string;
  };
  evolutionDetails: Array<{
    minLevel: number;
  }>;
  evolvesTo: ChainLink[];
}

export interface EvolutionChain {
  id: number;
  chain: ChainLink;
}

// Query Keys
export const pokemonKeys = {
  all: ["pokemons"] as const,
  lists: () => [...pokemonKeys.all, "list"] as const,
  list: (limit: number) => [...pokemonKeys.lists(), limit] as const,
  details: () => [...pokemonKeys.all, "detail"] as const,
  detail: (id: string | number) => [...pokemonKeys.details(), id] as const,
};

export const speciesKeys = {
  all: ["species"] as const,
  detail: (id: string | number) => [...speciesKeys.all, id] as const,
};

export const evolutionKeys = {
  all: ["evolutions"] as const,
  detail: (id: string | number) => [...evolutionKeys.all, id] as const,
};

// Hooks
export function usePokemonList(limit: number = 809) {
  return useQuery({
    queryKey: pokemonKeys.list(limit),
    queryFn: async () => {
      const data = await fromApi.getPokemons(limit);
      return camelcaseObject(data) as { results: NamedAPIResource[] };
    },
  });
}

export function usePokemon(pokemonId: string | number) {
  return useQuery({
    queryKey: pokemonKeys.detail(pokemonId),
    queryFn: async () => {
      const pokemon = await fromApi.getPokemonByNameOrId(pokemonId);
      const pokemonImageUrl = transformSpriteToBaseImage(
        pokemon.id,
        baseImageUrl
      );
      return {
        ...camelcaseObject(pokemon),
        sprites: {
          frontDefault: pokemonImageUrl,
        },
      } as Pokemon;
    },
    enabled: !!pokemonId,
  });
}

export function usePokemons(pokemonIds: number[]) {
  return useQueries({
    queries: pokemonIds.map((id) => ({
      queryKey: pokemonKeys.detail(id),
      queryFn: async () => {
        const pokemon = await fromApi.getPokemonByNameOrId(id);
        const pokemonImageUrl = transformSpriteToBaseImage(
          pokemon.id,
          baseImageUrl
        );
        return {
          ...camelcaseObject(pokemon),
          sprites: {
            frontDefault: pokemonImageUrl,
          },
        } as Pokemon;
      },
    })),
  });
}

export function useSpecies(pokemonId: string | number) {
  return useQuery({
    queryKey: speciesKeys.detail(pokemonId),
    queryFn: async () => {
      const species = await fromApi.getSpeciesByNameOrId(pokemonId);
      return camelcaseObject(species) as Species;
    },
    enabled: !!pokemonId,
  });
}

export function useEvolutionChain(chainId: string | number) {
  return useQuery({
    queryKey: evolutionKeys.detail(chainId),
    queryFn: async () => {
      const chain = await fromApi.getEvolutionChainById(chainId);
      return camelcaseObject(chain) as EvolutionChain;
    },
    enabled: !!chainId,
  });
}
