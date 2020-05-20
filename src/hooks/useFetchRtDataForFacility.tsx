import { useCallback, useContext } from "react";

import { FacilityEvents } from "../constants/dispatchEvents";
import { getRtDataForFacility } from "../infection-model/rt";
import { FacilityContext } from "../page-multi-facility/FacilityContext";
import { Facility } from "../page-multi-facility/types";

export default function useFetchRtDataForFacility() {
  const { rtData, dispatchRtData } = useContext(FacilityContext);

  return useCallback(async function fetchRtDataForFacility(facility: Facility) {
    // don't fetch data if we already have it
    if (rtData && rtData.hasOwnProperty(facility.id)) return;

    const facilityRtData = await getRtDataForFacility(facility);
    dispatchRtData({
      type: FacilityEvents.ADD,
      payload: { [facility.id]: facilityRtData },
    });

    // omitting dispatchRtData because it's not a stable reference,
    // due to being initialized inside SiteProvider.
    // TODO: may change as part of #163
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
