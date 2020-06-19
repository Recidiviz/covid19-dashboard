import {
  deleteFacility,
  duplicateFacility as duplicate,
  getFacilities,
  referenceFacilitiesProp,
  saveFacility,
} from "../../database";
import {
  Facilities,
  Facility,
  FacilityReferenceMapping,
  ReferenceFacility,
  Scenario,
} from "../../page-multi-facility/types";
import {
  FacilitiesDispatch,
  FacilityMapping,
  ReferenceFacilityMapping,
} from "../FacilitiesContext";
import { mergeFacilityObjects } from "../transforms";
import { fetchReferenceFacilities } from "./referenceFacilities";

export const REQUEST_FACILITIES = "REQUEST_FACILITIES";
export const RECEIVE_FACILITIES = "RECEIVE_FACILITIES";
export const RECEIVE_FACILITIES_ERROR = "RECEIVE_FACILITIES_ERROR";

export const SELECT_FACILITY = "SELECT_FACILITY";
export const DESELECT_FACILITY = "DESELECT_FACILITY";
export const REMOVE_FACILITY = "REMOVE_FACILITY";
export const CREATE_OR_UPDATE_FACILITY = "CREATE_OR_UPDATE_FACILITY";

export function deselectFacility(dispatch: FacilitiesDispatch) {
  return () => {
    dispatch({
      type: DESELECT_FACILITY,
    });
  };
}

export function selectFacility(dispatch: FacilitiesDispatch) {
  return (facilityId: Facility["id"]) => {
    dispatch({
      type: SELECT_FACILITY,
      payload: facilityId,
    });
  };
}

export async function fetchFacilities(
  shouldFetchReferenceFacilities: boolean,
  dispatch: FacilitiesDispatch,
  scenario: Scenario,
) {
  dispatch({ type: REQUEST_FACILITIES });
  try {
    const facilitiesList: Facilities | null = await getFacilities(scenario.id);
    let referenceFacilities: ReferenceFacilityMapping | undefined;
    const facilities: FacilityMapping = {};

    if (facilitiesList) {
      if (shouldFetchReferenceFacilities && facilitiesList.length) {
        // fetch reference facilities based on user facilities
        // first facility is the reference; assume they're all the same
        const {
          modelInputs: { stateName },
          systemType,
        } = facilitiesList[0];
        if (stateName && systemType) {
          referenceFacilities = await fetchReferenceFacilities(
            stateName,
            systemType,
            dispatch,
          );
        }
      }

      facilitiesList.forEach((facility) => {
        let referenceFacility: ReferenceFacility | undefined;

        if (scenario.useReferenceData && referenceFacilities) {
          referenceFacility =
            referenceFacilities[scenario[referenceFacilitiesProp][facility.id]];
        }

        facilities[facility.id] = mergeFacilityObjects({
          userFacility: facility,
          referenceFacility,
        });
      });

      dispatch({
        type: RECEIVE_FACILITIES,
        payload: { ...facilities },
      });
    }
  } catch (error) {
    console.error(`Error fetching facilities for scenario: ${scenario.id}`);
    console.error(error);
    dispatch({
      type: RECEIVE_FACILITIES_ERROR,
    });
  }
}

export function createOrUpdateFacility(
  dispatch: FacilitiesDispatch,
  scenario: Scenario | null,
  referenceFacilities: ReferenceFacilityMapping,
) {
  let facilityToReference: FacilityReferenceMapping = {};
  if (scenario && scenario.useReferenceData) {
    facilityToReference = scenario[referenceFacilitiesProp];
  }
  return async (scenarioId: string, facility: Partial<Facility>) => {
    if (scenarioId) {
      try {
        const updatedFacility = await saveFacility(scenarioId, facility);
        if (updatedFacility && updatedFacility.id) {
          dispatch({
            type: CREATE_OR_UPDATE_FACILITY,
            payload: mergeFacilityObjects({
              userFacility: updatedFacility,
              referenceFacility:
                referenceFacilities[facilityToReference[updatedFacility.id]],
            }),
          });
        }
        return updatedFacility;
      } catch (error) {
        console.error(
          `Error creating or updating facility for scenario: ${scenarioId}`,
        );
        throw error;
      }
    }
  };
}

export function removeFacility(dispatch: FacilitiesDispatch) {
  return async (scenarioId: string, facilityId: string) => {
    if (scenarioId && facilityId) {
      try {
        await deleteFacility(scenarioId, facilityId);
        dispatch({
          type: REMOVE_FACILITY,
          payload: facilityId,
        });
      } catch (error) {
        console.error(`Error deleting facility: ${facilityId}`);
        throw error;
      }
    }
  };
}

export function duplicateFacility(dispatch: FacilitiesDispatch) {
  return async (scenarioId: string, facility: Facility) => {
    if (scenarioId && facility.id) {
      try {
        const duplicatedFacility = await duplicate(scenarioId, facility);
        if (duplicatedFacility && duplicatedFacility.id) {
          dispatch({
            type: CREATE_OR_UPDATE_FACILITY,
            payload: { ...duplicatedFacility },
          });
        }
        return duplicatedFacility;
      } catch (error) {
        console.error(`Error duplicating facility: ${facility.id}`);
        throw error;
      }
    }
  };
}
