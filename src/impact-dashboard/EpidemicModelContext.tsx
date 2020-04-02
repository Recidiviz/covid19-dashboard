import React from "react";

const {
  populationAndHospitalData,
} = require("../page-overview/assets/dataSource") as any;

type Action = { type: "update"; payload: State };
type Dispatch = (action: Action) => void;
// TODO: define the real state
interface State {
  // could be the postal abbreviation like we use in the overview map, could be the FIPS code?
  // TODO: investigate external data source to firm this up
  stateCode: string;
  // TODO: similar to stateCode, could be the name or could be the FIPS code
  county?: string;
  facilityName?: string;
  totalIncarcerated: number;
  infectionRate: number;
  confirmedCases?: number;
  staff?: number;
  age0?: number;
  age20?: number;
  age45?: number;
  age55?: number;
  age65?: number;
  age75?: number;
  age85?: number;
}
type EpidemicModelProviderProps = { children: React.ReactNode };

const EpidemicModelStateContext = React.createContext<State | undefined>(
  undefined,
);

const EpidemicModelDispatchContext = React.createContext<Dispatch | undefined>(
  undefined,
);

function epidemicModelReducer(state: State, action: Action): State {
  switch (action.type) {
    case "update":
      // the desired user flow is to fill out a form, review the entries,
      // then submit it all at once; therefore we can just expose a single
      // action and merge the whole object into previous state.
      // it's not very granular but it doesn't need to be at the moment
      return Object.assign({}, state, action.payload);
  }
}

function EpidemicModelProvider({ children }: EpidemicModelProviderProps) {
  const [state, dispatch] = React.useReducer(epidemicModelReducer, {
    stateCode: "US",
    // TODO: is this really where the initial data should come from?
    totalIncarcerated: populationAndHospitalData.US.incarceratedPopulation,
    infectionRate: 3.7,
  });

  return (
    <EpidemicModelStateContext.Provider value={state}>
      <EpidemicModelDispatchContext.Provider value={dispatch}>
        {children}
      </EpidemicModelDispatchContext.Provider>
    </EpidemicModelStateContext.Provider>
  );
}

function useEpidemicModelState() {
  const context = React.useContext(EpidemicModelStateContext);

  if (context === undefined) {
    throw new Error(
      "useEpidemicModelState must be used within an EpidemicModelProvider",
    );
  }

  return context;
}

function useEpidemicModelDispatch() {
  const context = React.useContext(EpidemicModelDispatchContext);

  if (context === undefined) {
    throw new Error(
      "useEpidemicModelDispatch must be used within a EpidemicModelProvider",
    );
  }

  return context;
}

export {
  EpidemicModelProvider,
  useEpidemicModelState,
  useEpidemicModelDispatch,
};
