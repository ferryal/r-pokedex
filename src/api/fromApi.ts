import { HTTP_METHODS } from "../globals";
import { createApiRequest } from "./axios";

class ApiCallCreator {
  getPokemons(limit: number, offset?: number) {
    const offsetValue = offset || 20;
    return createApiRequest(
      `/pokemon/?limit=${limit}&offset=${offsetValue}`,
      HTTP_METHODS.GET,
      {}
    );
  }
  getPokemonByNameOrId(id: number | string) {
    return createApiRequest(`/pokemon/${id}/`, HTTP_METHODS.GET, {});
  }
  getSpeciesByNameOrId(id: number | string) {
    return createApiRequest(`/pokemon-species/${id}/`, HTTP_METHODS.GET, {});
  }
  getEvolutionChainById(id: string | number) {
    return createApiRequest(`/evolution-chain/${id}/`, HTTP_METHODS.GET, {});
  }
}

const fromApi = new ApiCallCreator();
export default fromApi;
