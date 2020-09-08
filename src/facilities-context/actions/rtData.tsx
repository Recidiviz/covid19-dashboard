import { getRtDataForFacility } from "../../infection-model/rt";
import { Facility } from "../../page-multi-facility/types";
import { FacilitiesDispatch } from "../FacilitiesContext";

export const REQUEST_RT_DATA = "REQUEST_RT_DATA";
export const RECEIVE_RT_DATA_ERROR = "RECEIVE_RT_DATA_ERROR";
export const UPDATE_FACILITY_RT_DATA = "UPDATE_FACILITY_RT_DATA";

export function fetchFacilityRtData(dispatch: FacilitiesDispatch) {
  return async (facility: Facility) => {
    dispatch({ type: REQUEST_RT_DATA, payload: facility.id });
    try {
      const facilityRtData = await getRtDataForFacility(facility);
      dispatch({
        type: UPDATE_FACILITY_RT_DATA,
        payload: { [facility.id]: facilityRtData },
      });
    } catch (error) {
      dispatch({ type: RECEIVE_RT_DATA_ERROR });
      console.error(
        `There was an error updating the Rt data for facility ${facility.id}`,
      );
    }
  };
}
