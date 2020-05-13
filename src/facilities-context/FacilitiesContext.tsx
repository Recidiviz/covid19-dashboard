import React, { useEffect } from "react";

import { Facility } from "../page-multi-facility/types";
import useScenario from "../scenario-context/useScenario";
import { facilitiesReducer } from "./reducer";
import * as actions from "./actions";

export type FacilityMapping = { [key in Facility["id"]]: Facility }

export interface FacilitiesState {
  loading: boolean;
  failed: boolean;
  facilities: FacilityMapping;
}

export type FacilitiesDispatch = (action: actions.FacilitiesActions) => void;

export type ExportedAsyncActions = {
  updateFacility: (...props: any) => Promise<void>;
  removeFacility: (...props: any) => Promise<void>;
  // fetchRtData: ExportedAsyncFunction;
}

export interface FacilitiesContext {
  state: FacilitiesState;
  dispatch: FacilitiesDispatch | undefined;
  asyncActions: ExportedAsyncActions;
}

export const FacilitiesContext = React.createContext<FacilitiesContext | undefined>(
  undefined,
);

export const FacilitiesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = React.useReducer(facilitiesReducer, {
    loading: true,
    failed: false,
    facilities: {},
  });

  const [scenario] = useScenario();
  const scenarioId = scenario?.data?.id

  useEffect(() => {
    if (scenarioId) {
      actions.fetchFacilities(scenarioId, dispatch);
    }
  }, [scenarioId]);

  const asyncActions = {
    updateFacility: actions.updateFacility(dispatch),
    removeFacility: actions.removeFacility(dispatch)
  }

  return (
    <FacilitiesContext.Provider value={{ state, dispatch, asyncActions }}>
      {children}
    </FacilitiesContext.Provider>
  );
};

export function useFacilities() {
  const context = React.useContext(FacilitiesContext);

  if (context === undefined) {
    throw new Error(
      "useFacilities must be used within a FacilitiesProvider",
    );
  }

  return context
}
