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
  ReferenceFacility,
  Scenario,
} from "../../page-multi-facility/types";
import {
  FacilitiesDispatch,
  FacilityMapping,
  ReferenceFacilityMapping,
} from "../FacilitiesContext";
import { mergeFacilityObjects } from "../transforms";
import {
  CLEAR_REFERENCE_FACILITIES,
  fetchReferenceFacilities,
} from "./referenceFacilities";

export const REQUEST_FACILITIES = "REQUEST_FACILITIES";
export const RECEIVE_FACILITIES = "RECEIVE_FACILITIES";
export const RECEIVE_FACILITIES_ERROR = "RECEIVE_FACILITIES_ERROR";

export const SELECT_FACILITY = "SELECT_FACILITY";
export const DESELECT_FACILITY = "DESELECT_FACILITY";
export const REMOVE_FACILITY = "REMOVE_FACILITY";
export const CREATE_OR_UPDATE_FACILITY = "CREATE_OR_UPDATE_FACILITY";

function getReferenceFacility({
  scenario,
  referenceFacilities,
  facility,
}: {
  scenario: Scenario;
  referenceFacilities: ReferenceFacilityMapping;
  facility: Facility;
}): ReferenceFacility | undefined {
  if (scenario.useReferenceData) {
    // this will be undefined if there are no reference facilities,
    // or if there isn't a mapping in facilityToReference. So this is
    // still safe if the feature is turned off or not configured
    return referenceFacilities[scenario[referenceFacilitiesProp][facility.id]];
  }
  return undefined;
}

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
  dispatch({ type: CLEAR_REFERENCE_FACILITIES });
  try {
    const facilitiesList: Facilities | null = await getFacilities(scenario.id);
    let referenceFacilities: ReferenceFacilityMapping = {};
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
        facilities[facility.id] = mergeFacilityObjects({
          userFacility: facility,
          referenceFacility: getReferenceFacility({
            scenario,
            referenceFacilities,
            facility,
          }),
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
  return async (facility: Partial<Facility>) => {
    if (scenario) {
      try {
        let updatedFacility = await saveFacility(scenario.id, facility);
        if (updatedFacility && updatedFacility.id) {
          updatedFacility = mergeFacilityObjects({
            userFacility: updatedFacility,
            referenceFacility: getReferenceFacility({
              scenario,
              referenceFacilities,
              facility: updatedFacility,
            }),
          });
          dispatch({
            type: CREATE_OR_UPDATE_FACILITY,
            payload: updatedFacility,
          });
        }
        return updatedFacility;
      } catch (error) {
        console.error(
          `Error creating or updating facility for scenario: ${scenario.id}`,
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

export function duplicateFacility(
  dispatch: FacilitiesDispatch,
  scenario: Scenario | null,
  referenceFacilities: ReferenceFacilityMapping,
) {
  return async (facility: Facility) => {
    if (scenario && facility.id) {
      try {
        let duplicatedFacility = await duplicate(scenario.id, facility);
        if (duplicatedFacility && duplicatedFacility.id) {
          duplicatedFacility = mergeFacilityObjects({
            userFacility: duplicatedFacility,
            referenceFacility: getReferenceFacility({
              scenario,
              referenceFacilities,
              facility: duplicatedFacility,
            }),
          });
          dispatch({
            type: CREATE_OR_UPDATE_FACILITY,
            payload: duplicatedFacility,
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
