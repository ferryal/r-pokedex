import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import SplashScreen from "./components/SplashScreen";
import {
  cachedPokemonsSelector,
  getCachedPokemons,
} from "./features/cachedPokemonsSlice";
import { useAppDispatch, useAppSelector } from "./features/hooks";
import { queryClient } from "./lib/queryClient";

import { SliceStatus } from "./globals";
import Routes from "./Routes";

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const cachedPokemons = useAppSelector(cachedPokemonsSelector);

  useEffect(() => {
    dispatch(getCachedPokemons());
    //eslint-disable-next-line
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {cachedPokemons.status.state === SliceStatus.LOADING ||
      cachedPokemons.status.state === SliceStatus.IDLE ? (
        <SplashScreen />
      ) : (
        <BrowserRouter>
          <Routes />
        </BrowserRouter>
      )}
    </QueryClientProvider>
  );
};

export default App;
