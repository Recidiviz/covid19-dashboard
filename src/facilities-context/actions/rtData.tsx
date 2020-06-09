import { getRtDataForFacility } from "../../infection-model/rt";
import { Facility, RtDataMapping } from "../../page-multi-facility/types";
import { FacilitiesDispatch, FacilitiesState } from "../FacilitiesContext";

export const REQUEST_RT_DATA = "REQUEST_RT_DATA";
export const RECEIVE_RT_DATA = "RECEIVE_RT_DATA";
export const RECEIVE_RT_DATA_ERROR = "RECEIVE_RT_DATA_ERROR";
export const UPDATE_FACILITY_RT_DATA = "UPDATE_FACILITY_RT_DATA";

export async function fetchRtData(
  facilities: FacilitiesState["facilities"],
  rtData: FacilitiesState["rtData"],
  dispatch: FacilitiesDispatch,
) {
  dispatch({ type: REQUEST_RT_DATA });

  try {
    const rtDataForFacilities: RtDataMapping = {};

    await Promise.all(
      Object.values({ ...facilities }).map(async (facility) => {
        // don't fetch data if we already have it
        if (rtData && rtData.hasOwnProperty(facility.id)) return;
        const facilityRtData = await getRtDataForFacility(facility);
        rtDataForFacilities[facility.id] = facilityRtData;
      }),
    );

    dispatch({
      type: RECEIVE_RT_DATA,
      payload: rtDataForFacilities,
    });
  } catch (error) {
    dispatch({
      type: RECEIVE_RT_DATA_ERROR,
    });
  }
}

export function updateRtData(dispatch: FacilitiesDispatch) {
  return async (facility: Facility) => {
    try {
      const facilityRtData = await getRtDataForFacility(facility);
      dispatch({
        type: UPDATE_FACILITY_RT_DATA,
        payload: { [facility.id]: facilityRtData },
      });
    } catch (error) {
      console.error(
        `There was an error updating the Rt data for facility ${facility.id}`,
      );
    }
  };
}
