import { isEmpty, size } from "lodash";
import React, { useEffect } from "react";

import { referenceFacilitiesProp } from "../database";
import { useFlag } from "../feature-flags";
import {
  Facility,
  RtDataMapping,
  Scenario,
} from "../page-multi-facility/types";
import useScenario from "../scenario-context/useScenario";
import * as facilitiesActions from "./actions";
import { facilitiesReducer } from "./reducer";
import { FacilityMapping, ReferenceFacilityMapping } from "./types";
import { isSingleSystem } from "./validators";

const MIN_REFERENCE_FACILITIES = 3;

export interface FacilitiesState {
  loading: boolean;
  failed: boolean;
  facilities: FacilityMapping;
  referenceFacilities: ReferenceFacilityMapping;
  selectedFacilityId: Facility["id"] | null;
  rtData: RtDataMapping;
  canUseReferenceData: boolean;
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
  selectFacility: (facilityId: Facility["id"]) => void;
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
    canUseReferenceData: false,
  });
  const [scenarioState] = useScenario();

  const scenario = scenarioState.data;
  const scenarioId = scenario?.id;

  const referenceDataFeatureAvailable =
    useFlag(["enableShadowData"]) && !!scenario?.baseline;

  const referenceDataActive =
    referenceDataFeatureAvailable && scenario?.useReferenceData;

  const facilityToReference =
    scenario && referenceDataActive
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
    selectFacility: facilitiesActions.selectFacility(dispatch),
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

  async function prepareReferenceFacilities(facilities: FacilityMapping) {
    // fetch reference facilities based on user facilities
    // first facility is the reference; assume they're all the same
    const userFacility = Object.values(facilities)[0];
    if (!userFacility) return facilities;
    const {
      modelInputs: { stateName },
      systemType,
    } = userFacility && userFacility;

    if (stateName && systemType) {
      const referenceFacilities = await facilitiesActions.fetchReferenceFacilities(
        stateName,
        systemType,
      );

      dispatch({
        type: facilitiesActions.RECEIVE_REFERENCE_FACILITIES,
        payload: referenceFacilities,
      });

      return facilitiesActions.buildCompositeFacilities(
        facilities,
        referenceFacilities,
        facilityToReference,
      );
    }
    return facilities;
  }

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
          facilitiesActions.setCanUseReferenceData(dispatch, false);
          try {
            let facilities = await facilitiesActions.fetchUserFacilities(
              scenarioId,
            );

            // some eligibility checks are dependent on the reference facilities
            // data itself, so we may update this before we're done here
            let referenceDataEligible =
              referenceDataFeatureAvailable &&
              Boolean(size(facilities)) &&
              isSingleSystem(facilities);

            // currently active status trumps any eligibility violations
            if (referenceDataEligible || referenceDataActive) {
              // fetch reference facilities based on user facilities
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

                referenceDataEligible =
                  referenceDataEligible &&
                  size(referenceFacilities) >= MIN_REFERENCE_FACILITIES;

                // "eligible" only applies to scenarios that don't already have the
                // feature toggled on (i.e., referenceDataActive === true);
                // therefore this merge isn't actually conditional on that flag
                // (but facilityToReference is conditional on referenceDataActive, so
                // the final merge result will still reflect the toggle state)
                facilities = facilitiesActions.buildCompositeFacilities(
                  facilities,
                  referenceFacilities,
                  facilityToReference,
                );
              }
            }
            // dispatch facilities to state
            facilitiesActions.receiveFacilities(dispatch, facilities);

            // UI elements conditioned on the reference data feature can watch this
            facilitiesActions.setCanUseReferenceData(
              dispatch,
              // the feature already being activated trumps any eligibility criteria
              referenceDataActive || referenceDataEligible,
            );
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
          facilitiesActions.setCanUseReferenceData(dispatch, false);
        }
      }
      initializeFacilities();
    },

    // These booleans should change at the same time as the scenarioId
    // and are safe to depend on here; however, we don't want to fire all of this logic off
    // every time facilityToReference changes; we want explicitly to depend on its initial
    // state when a new scenario is loaded, so it is excluded here.
    // Another effect will handle subsequent changes to its value based on user input
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scenarioId, referenceDataActive, referenceDataFeatureAvailable],
  );

  // update facilities when reference mapping changes
  useEffect(
    () => {
      if (state.loading || isEmpty(facilityToReference)) return;
      async function updateFacilities() {
        let facilities = state.facilities;
        // If user just synced new reference facilities and is updating
        // facilityToReference for the first time after initialization, then
        // referenceFacilities will not be loaded yet.
        if (isEmpty(state.referenceFacilities)) {
          facilities = await prepareReferenceFacilities(facilities);
        } else {
          facilities = facilitiesActions.buildCompositeFacilities(
            facilities,
            state.referenceFacilities,
            facilityToReference,
          );
        }

        facilitiesActions.receiveFacilities(dispatch, facilities);
      }
      updateFacilities();
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
