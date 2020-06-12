import React, { useEffect } from "react";

import useShadowDataEligible from "../hooks/useShadowDataEligible";
import {
  Facility,
  RtDataMapping,
  Scenario,
  ShadowFacility,
} from "../page-multi-facility/types";
import useScenario from "../scenario-context/useScenario";
import * as facilitiesActions from "./actions";
import { facilitiesReducer } from "./reducer";

export type FacilityMapping = { [key in Facility["id"]]: Facility };

export type ShadowFacilityMapping = {
  [key in ShadowFacility["id"]]: ShadowFacility;
};

export interface FacilitiesState {
  loading: boolean;
  failed: boolean;
  facilities: FacilityMapping;
  shadowFacilities: ShadowFacilityMapping;
  selectedFacilityId: Facility["id"] | null;
  rtData: RtDataMapping;
}

export type FacilitiesDispatch = (
  action: facilitiesActions.FacilitiesActions,
) => void;

export type ExportedActions = {
  fetchFacilityRtData: (facility: Facility) => Promise<void>;
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

interface FacilitiesContext {
  state: FacilitiesState;
  dispatch: FacilitiesDispatch | undefined;
  actions: ExportedActions;
}

const FacilitiesContext = React.createContext<FacilitiesContext | undefined>(
  undefined,
);

export const FacilitiesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = React.useReducer(facilitiesReducer, {
    loading: true,
    failed: false,
    facilities: {},
    shadowFacilities: {},
    selectedFacilityId: null,
    rtData: {},
  });
  const [scenario] = useScenario();
  const scenarioId = scenario?.data?.id;
  const actions = {
    createOrUpdateFacility: facilitiesActions.createOrUpdateFacility(dispatch),
    fetchFacilityRtData: facilitiesActions.fetchFacilityRtData(dispatch),
    removeFacility: facilitiesActions.removeFacility(dispatch),
    duplicateFacility: facilitiesActions.duplicateFacility(dispatch),
    deselectFacility: facilitiesActions.deselectFacility(dispatch),
    selectFacility: facilitiesActions.selectFacility(dispatch),
  };

  useEffect(() => {
    if (scenarioId) {
      facilitiesActions.fetchFacilities(scenarioId, dispatch);
    }
  }, [scenarioId]);

  useEffect(() => {
    const facilities = Object.values({ ...state.facilities });
    if (facilities.length) {
      facilities.forEach((facility) => {
        if (!state.rtData.hasOwnProperty(facility.id)) {
          facilitiesActions.fetchFacilityRtData(dispatch)(facility);
        }
      });
    }
  }, [scenarioId, state.facilities, state.rtData]);

  // fetch shadow facilities based on user facilities
  const shouldFetchShadow = useShadowDataEligible();
  useEffect(() => {
    if (!shouldFetchShadow) {
      // clean up any existing shadow facility data
      facilitiesActions.clearShadowFacilities(dispatch);
      return;
    }

    const facilities = Object.values({ ...state.facilities });
    if (facilities.length) {
      // first facility is the reference; assume they're all the same
      const {
        modelInputs: { stateCode },
        systemType,
      } = facilities[0];
      if (stateCode && systemType) {
        facilitiesActions.fetchShadowFacilities(
          stateCode,
          systemType,
          dispatch,
        );
      }
    }
  }, [shouldFetchShadow, state.facilities]);

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
