import React, { useEffect } from "react";

import useError from "../hooks/useError";
import {
  Facility,
  RtDataMapping,
  Scenario,
} from "../page-multi-facility/types";
import useScenario from "../scenario-context/useScenario";
import * as facilitiesActions from "./actions";
import { facilitiesReducer } from "./reducer";

export type FacilityMapping = { [key in Facility["id"]]: Facility };

export interface FacilitiesState {
  loading: boolean;
  failed: boolean;
  facilities: FacilityMapping;
  selectedFacilityId: Facility["id"] | null;
  rtData: RtDataMapping;
}

export type FacilitiesDispatch = (
  action: facilitiesActions.FacilitiesActions,
) => void;

export type Exportedactions = {
  updateRtData: (facility: Facility) => Promise<void>;
  createOrUpdateFacility: (
    scenarioId: Scenario["id"],
    facility: Partial<Facility>,
  ) => Promise<void>;
  removeFacility: (
    scenarioId: Scenario["id"],
    facilityId: Facility["id"],
  ) => Promise<void>;
  duplicateFacility: (
    scenarioId: Scenario["id"],
    facility: Facility,
  ) => Promise<Facility | void>;
  deselectFacility: () => void;
  selectFacility: (faclityId: Facility["id"]) => void;
};

export interface FacilitiesContext {
  state: FacilitiesState;
  dispatch: FacilitiesDispatch | undefined;
  actions: Exportedactions;
}

export const FacilitiesContext = React.createContext<
  FacilitiesContext | undefined
>(undefined);

export const FacilitiesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = React.useReducer(facilitiesReducer, {
    loading: true,
    failed: false,
    facilities: {},
    selectedFacilityId: null,
    rtData: {},
  });
  const rethrowSync = useError();
  const [scenario] = useScenario();
  const scenarioId = scenario?.data?.id;
  const actions = {
    createOrUpdateFacility: facilitiesActions.createOrUpdateFacility(dispatch),
    updateRtData: facilitiesActions.updateRtData(dispatch),
    removeFacility: facilitiesActions.removeFacility(dispatch),
    duplicateFacility: facilitiesActions.duplicateFacility(dispatch),
    deselectFacility: facilitiesActions.deselectFacility(dispatch),
    selectFacility: facilitiesActions.selectFacility(dispatch),
  };

  useEffect(() => {
    if (scenarioId) {
      try {
        facilitiesActions.fetchFacilities(scenarioId, dispatch);
      } catch (e) {
        rethrowSync(e);
      }
    }
  }, [scenarioId]);

  useEffect(() => {
    if (Object.values(state.facilities).length) {
      try {
        facilitiesActions.fetchRtData(state, dispatch);
      } catch (e) {
        rethrowSync(e);
      }
    }
  }, [scenarioId, state.facilities]);

  return (
    <FacilitiesContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </FacilitiesContext.Provider>
  );
};

export function useFacilities() {
  const context = React.useContext(FacilitiesContext);

  if (context === undefined) {
    throw new Error("useFacilities must be used within a FacilitiesProvider");
  }

  return context;
}