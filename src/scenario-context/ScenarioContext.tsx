import React, { useEffect } from "react";

import { getBaselineScenario } from "../database";
import { Scenario } from "../page-multi-facility/types";

export type ScenarioUpdate = {
  loading?: boolean;
  failed?: boolean;
  data?: Scenario | null;
};

interface ScenarioState {
  loading: boolean;
  failed: boolean;
  data: Scenario | null;
}

type Action = { type: "update"; payload: ScenarioUpdate };
type Dispatch = (action: Action) => void;

const StateContext = React.createContext<ScenarioState | undefined>(undefined);
const DispatchContext = React.createContext<Dispatch | undefined>(undefined);

function scenarioReducer(state: ScenarioState, action: Action): ScenarioState {
  switch (action.type) {
    case "update":
      return Object.assign({}, state, action.payload);
  }
}

export const ScenarioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = React.useReducer(scenarioReducer, {
    loading: true,
    failed: false,
    data: null,
  });

  useEffect(() => {
    async function fetchBaselineScenario() {
      const baselineScenario = await getBaselineScenario();
      dispatch({
        type: "update",
        payload: {
          data: baselineScenario,
          loading: false,
        },
      });
    }
    fetchBaselineScenario();
  }, []);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
};

export function useScenarioState() {
  const context = React.useContext(StateContext);

  if (context === undefined) {
    throw new Error("useScenarioState must be used within an ScenarioProvider");
  }

  return context;
}

export function useScenarioDispatch() {
  const context = React.useContext(DispatchContext);

  if (context === undefined) {
    throw new Error(
      "useScenarioDispatch must be used within a ScenarioProvider",
    );
  }

  return context;
}
