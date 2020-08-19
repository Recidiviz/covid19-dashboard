import {
  deleteFacility,
  duplicateFacility as duplicate,
  getFacilities,
  saveFacility,
} from "../../database";
import { Facilities, Facility } from "../../page-multi-facility/types";
import { FacilitiesDispatch, FacilityMapping } from "../FacilitiesContext";

export const CLEAR_FACILITIES = "CLEAR_FACILITIES";
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

export function requestFacilities(dispatch: FacilitiesDispatch) {
  dispatch({ type: REQUEST_FACILITIES });
}

export async function fetchUserFacilities(scenarioId: string) {
  const facilitiesList: Facilities | null = await getFacilities(scenarioId);
  const facilities: FacilityMapping = {};

  facilitiesList?.forEach((facility) => {
    facilities[facility.id] = facility;
  });

  return facilities;
}

export function receiveFacilities(
  dispatch: FacilitiesDispatch,
  payload: FacilityMapping,
) {
  dispatch({ type: RECEIVE_FACILITIES, payload });
}

export function receiveFacilitiesError(dispatch: FacilitiesDispatch) {
  dispatch({
    type: RECEIVE_FACILITIES_ERROR,
  });
}

export async function createOrUpdateFacility(
  scenarioId: string,
  facility: Partial<Facility>,
) {
  try {
    return await saveFacility(scenarioId, facility);
  } catch (error) {
    console.error(
      `Error creating or updating facility for scenario: ${scenarioId}`,
    );
    throw error;
  }
}

export function updateFacilities(
  dispatch: FacilitiesDispatch,
  updatedFacility: Facility,
) {
  dispatch({
    type: CREATE_OR_UPDATE_FACILITY,
    payload: updatedFacility,
  });
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

export async function duplicateFacility(
  scenarioId: string,
  facility: Facility,
) {
  try {
    return await duplicate(scenarioId, facility);
  } catch (error) {
    console.error(`Error duplicating facility: ${facility.id}`);
    throw error;
  }
}
