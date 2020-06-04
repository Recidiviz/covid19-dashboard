import React, { useEffect } from "react";

import { Facility, RtDataMapping } from "../page-multi-facility/types";
import useScenario from "../scenario-context/useScenario";
import { facilitiesReducer } from "./reducer";

import useError from "../hooks/useError";

import * as actions from "./actions";

export type FacilityMapping = { [key in Facility["id"]]: Facility }

export interface FacilitiesState {
  loading: boolean;
  failed: boolean;
  facilities: FacilityMapping;
  selectedFacility: Facility | null;
  rtData: RtDataMapping
}

export type FacilitiesDispatch = (action: actions.FacilitiesActions) => void;

export type ExportedAsyncActions = {
  updateFacility: (...props: any) => Promise<void>;
  removeFacility: (...props: any) => Promise<void>;
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
    selectedFacility: null,
    rtData: {}
  });
  const rethrowSync = useError();
  const [scenario] = useScenario();
  const scenarioId = scenario?.data?.id
  const asyncActions = {
    updateFacility: actions.updateFacility(dispatch),
    removeFacility: actions.removeFacility(dispatch)
  }

  useEffect(() => {
    if (scenarioId) {
      try {
        actions.fetchFacilities(scenarioId, dispatch);
      } catch (e) {
        rethrowSync(e);
      }
    }
  }, [scenarioId]);

  useEffect(() => {
    if (Object.values(state.facilities).length) {
      try {
        actions.fetchRtData(state, dispatch);
      } catch (e) {
        rethrowSync(e);
      }
    }
  }, [scenarioId, state.facilities])

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
