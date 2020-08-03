import { isEmpty, size } from "lodash";
import React, { useEffect } from "react";

import { referenceFacilitiesProp } from "../database";
import useReferenceFacilitiesEligible from "../hooks/useReferenceFacilitiesEligible";
import {
  Facility,
  ReferenceFacility,
  RtDataMapping,
  Scenario,
} from "../page-multi-facility/types";
import useScenario from "../scenario-context/useScenario";
import * as facilitiesActions from "./actions";
import { facilitiesReducer } from "./reducer";

export type FacilityMapping = { [key in Facility["id"]]: Facility };

export type ReferenceFacilityMapping = {
  [key in ReferenceFacility["id"]]: ReferenceFacility;
};

export interface FacilitiesState {
  loading: boolean;
  failed: boolean;
  facilities: FacilityMapping;
  referenceFacilities: ReferenceFacilityMapping;
  selectedFacilityId: Facility["id"] | null;
  rtData: RtDataMapping;
}

export type FacilitiesDispatch = (
  action: facilitiesActions.FacilitiesActions,
) => void;

export type ExportedActions = {
  fetchFacilityRtData: (facility: Facility) => Promise<void>;
  createOrUpdateFacility: (
    facility: Partial<Facility>,
  ) => Promise<Facility | void>;
  removeFacility: (
    scenarioId: Scenario["id"],
    facilityId: Facility["id"],
  ) => Promise<void>;
  duplicateFacility: (facility: Facility) => Promise<Facility | void>;
  deselectFacility: () => void;
  selectFacility: (facilityId: Facility["id"]) => Promise<void>;
  fetchReferenceFacilities: (
    stateName: string,
    systemType: string,
  ) => Promise<ReferenceFacilityMapping>;
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
    referenceFacilities: {},
    selectedFacilityId: null,
    rtData: {},
  });
  const [scenarioState] = useScenario();

  const scenario = scenarioState.data;
  const scenarioId = scenario?.id;

  const shouldFetchReferenceFacilities = useReferenceFacilitiesEligible();
  const shouldUseReferenceFacilities =
    shouldFetchReferenceFacilities && scenario?.useReferenceData;

  const facilityToReference =
    scenario && shouldUseReferenceFacilities
      ? scenario[referenceFacilitiesProp]
      : undefined;

  const actions = {
    createOrUpdateFacility: async (
      facility: Partial<Facility>,
    ): Promise<void | Facility> => {
      if (scenarioId) {
        const savedFacility = await facilitiesActions.createOrUpdateFacility(
          scenarioId,
          facility,
        );
        if (savedFacility) {
          // if shadow data is disabled or there is no mapped reference facility,
          // this action will pass through the user data unchanged
          const compositeFacility = facilitiesActions.buildCompositeFacility(
            savedFacility,
            state.referenceFacilities,
            facilityToReference,
          );
          facilitiesActions.updateFacilities(dispatch, compositeFacility);
          return compositeFacility;
        }
      }
    },
    fetchFacilityRtData: facilitiesActions.fetchFacilityRtData(dispatch),
    removeFacility: facilitiesActions.removeFacility(dispatch),
    duplicateFacility: async (facility: Facility): Promise<void | Facility> => {
      if (scenarioId) {
        const savedFacility = await facilitiesActions.duplicateFacility(
          scenarioId,
          facility,
        );
        if (savedFacility) {
          // if shadow data is disabled or there is no mapped reference facility,
          // this action will pass through the user data unchanged
          const compositeFacility = facilitiesActions.buildCompositeFacility(
            savedFacility,
            state.referenceFacilities,
            facilityToReference,
          );
          facilitiesActions.updateFacilities(dispatch, compositeFacility);
          return compositeFacility;
        }
      }
    },
    deselectFacility: facilitiesActions.deselectFacility(dispatch),
    selectFacility: async (facilityId: string): Promise<void> => {
      facilitiesActions.selectFacility(facilityId, dispatch);
    },
    fetchReferenceFacilities: async (
      stateName: string,
      systemType: string,
    ): Promise<ReferenceFacilityMapping> => {
      return await facilitiesActions.fetchReferenceFacilities(
        stateName,
        systemType,
      );
    },
  };

  // when a new scenario is loaded, facility data must be initialized
  // in a specific order to avoid unwanted side effects:
  // we fetch user facility data, then fetch reference data (when applicable);
  // only when both fetches are complete and any necessary merges are done
  // can we then dispatch facility data into the context
  useEffect(
    () => {
      async function initializeFacilities() {
        if (scenarioId) {
          facilitiesActions.requestFacilities(dispatch);
          facilitiesActions.clearReferenceFacilities(dispatch);
          try {
            let facilities = await facilitiesActions.fetchUserFacilities(
              scenarioId,
            );

            if (shouldFetchReferenceFacilities && size(facilities)) {
              // fetch reference facilities based on user facilities
              // first facility is the reference; assume they're all the same
              const {
                modelInputs: { stateName },
                systemType,
              } = Object.values(facilities)[0];
              if (stateName && systemType) {
                const referenceFacilities = await facilitiesActions.fetchReferenceFacilities(
                  stateName,
                  systemType,
                );

                dispatch({
                  type: facilitiesActions.RECEIVE_REFERENCE_FACILITIES,
                  payload: referenceFacilities,
                });

                facilities = facilitiesActions.buildCompositeFacilities(
                  facilities,
                  referenceFacilities,
                  facilityToReference,
                );
              }
            }
            // dispatch facilities to state
            facilitiesActions.receiveFacilities(dispatch, facilities);
          } catch (error) {
            console.error(
              `Error fetching facilities for scenario: ${scenarioId}`,
            );
            console.error(error);
            facilitiesActions.receiveFacilitiesError(dispatch);
          }
        } else {
          // Clear facilities if there is no new scenarioId
          dispatch({ type: facilitiesActions.CLEAR_FACILITIES });
          dispatch({ type: facilitiesActions.CLEAR_REFERENCE_FACILITIES });
        }
      }
      initializeFacilities();
    },

    // shouldFetchReferenceFacilities should change at the same time as the scenarioId
    // and is safe to depend on here; however, we don't want to fire all of this logic off
    // every time facilityToReference changes; we want explicitly to depend on its initial
    // state when a new scenario is loaded, so it is excluded here.
    // Another effect will handle subsequent changes to its value based on user input
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scenarioId, shouldFetchReferenceFacilities],
  );

  // update facilities when reference mapping changes
  useEffect(
    () => {
      if (state.loading || isEmpty(facilityToReference)) return;
      facilitiesActions.receiveFacilities(
        dispatch,
        facilitiesActions.buildCompositeFacilities(
          state.facilities,
          state.referenceFacilities,
          facilityToReference,
        ),
      );
    },
    // we are controlling changes to the state imperatively via the action functions,
    // so it should be safe to exclude. When facilityToReference changes (externally
    // to this context) we can safely use the most recent state
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [facilityToReference],
  );

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
