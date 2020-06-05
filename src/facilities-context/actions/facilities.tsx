import {
  saveFacility,
  deleteFacility,
  getFacilities,
  duplicateFacility as duplicate,
} from "../../database";
import {
  FacilitiesDispatch,
  FacilityMapping,
} from "../FacilitiesContext";
import { Facilities, Facility } from "../../page-multi-facility/types";

export const REQUEST_FACILITIES = "REQUEST_FACILITIES";
export const RECEIVE_FACILITIES = "RECEIVE_FACILITIES";
export const RECEIVE_FACILITIES_ERROR = "RECEIVE_FACILITIES_ERROR";

export const SELECT_FACILITY = "SELECT_FACILITY";
export const UNSELECT_FACILITY = "UNSELECT_FACILITY";
export const REMOVE_FACILITY = "REMOVE_FACILITY";
export const CREATE_OR_UPDATE_FACILITY = "CREATE_OR_UPDATE_FACILITY";

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
    // note: should save error message in the state.
    // currently getFacilities returns null if there is an error
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
        console.log('create or update facility: ', updatedFacility)
        dispatch({
          type: CREATE_OR_UPDATE_FACILITY,
          payload: { ...updatedFacility },
        });
      } catch (error) {
        // handle updating facility errors
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
          payload: { id: facilityId },
        });
      } catch (error) {
        // handle deleting facility errors
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
          console.log('facility duplicated: ', duplicatedFacility)
          dispatch({
            type: CREATE_OR_UPDATE_FACILITY,
            payload: { ...duplicatedFacility },
          });
          dispatch({
            type: SELECT_FACILITY,
            payload: { id: duplicatedFacility.id }
          })
        }
      } catch (error) {
        // handle duplicating facility errors
      }
    }
  };
}
