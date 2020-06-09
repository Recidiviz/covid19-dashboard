import {
  deleteFacility,
  duplicateFacility as duplicate,
  getFacilities,
  saveFacility,
} from "../../database";
import { Facilities, Facility } from "../../page-multi-facility/types";
import { FacilitiesDispatch, FacilityMapping } from "../FacilitiesContext";

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
  scenarioId: string,
  dispatch: FacilitiesDispatch,
) {
  dispatch({ type: REQUEST_FACILITIES });
  try {
    const facilitiesList: Facilities | null = await getFacilities(scenarioId);
    const facilities: FacilityMapping = {};

    if (facilitiesList) {
      facilitiesList.forEach((facility) => {
        facilities[facility.id] = facility;
      });

      dispatch({
        type: RECEIVE_FACILITIES,
        payload: { ...facilities },
      });
    }
  } catch (error) {
    console.error(`Error fetching facilities for scenario: ${scenarioId}`);
    dispatch({
      type: RECEIVE_FACILITIES_ERROR,
    });
  }
}

export function createOrUpdateFacility(dispatch: FacilitiesDispatch) {
  return async (scenarioId: string, facility: Partial<Facility>) => {
    if (scenarioId) {
      try {
        const updatedFacility = await saveFacility(scenarioId, facility);
        if (updatedFacility && updatedFacility.id) {
          dispatch({
            type: CREATE_OR_UPDATE_FACILITY,
            payload: { ...updatedFacility },
          });
        }
      } catch (error) {
        console.error(
          `Error creating or updating facility for scenario: ${scenarioId}`,
        );
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
      }
    }
  };
}
