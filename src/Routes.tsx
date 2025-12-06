import React from "react";

import { Routes as RouterRoutes, Route, useLocation } from "react-router-dom";
import { useTransition, animated } from "react-spring";
import SplashScreen from "./components/SplashScreen";
import PokemonDetailsPage from "./pages/PokemonDetailsPage";
const PokemonsPage = React.lazy(() => import("./pages/PokemonsPage"));

const Routes: React.FC = () => {
  const location = useLocation();
  const transitions = useTransition(location, {
    key: location.pathname,
    config: {
      duration: 250,
    },
    from: {
      opacity: 0.25,
    },
    enter: {
      opacity: 1,
    },
    leave: {
      opacity: 0.25,
    },
  });

  return (
    <React.Suspense fallback={<SplashScreen />}>
      {transitions((props, item) => (
        <animated.div
          style={{
            ...props,
            width: "100%",
            position: "absolute",
          }}
        >
          <RouterRoutes location={item}>
            <Route path="/pokemons/:id" element={<PokemonDetailsPage />} />
            <Route path="/" element={<PokemonsPage />} />
          </RouterRoutes>
        </animated.div>
      ))}
    </React.Suspense>
  );
};
export default Routes;
