import { useContext, useEffect } from "react";

import { FacilityEvents } from "../constants/dispatchEvents";
import { FacilityContext } from "../contexts/facility-context/FacilityContext";
import { getRtDataForFacility } from "../infection-model/rt";
import { Facilities } from "../page-multi-facility/types";

const useFacilitiesRtData = (facilities: Facilities | null) => {
  const { rtData, dispatchRtData } = useContext(FacilityContext);

  async function fetchRtDataForFacilities(facilities: Facilities) {
    return await Promise.all(
      [...facilities].map(async (facility) => {
        // don't fetch data if we already have it
        if (rtData && rtData.hasOwnProperty(facility.id)) return;

        const facilityRtData = await getRtDataForFacility(facility);
        dispatchRtData({
          type: FacilityEvents.ADD,
          payload: { [facility.id]: facilityRtData },
        });
      }),
    );
  }

  useEffect(
    () => {
      if (facilities) {
        fetchRtDataForFacilities(facilities);
      }
    },
    // omitting dispatchRtData because it's not a stable reference,
    // due to being initialized inside SiteProvider.
    // TODO: may change as part of #163
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [facilities],
  );
};

export default useFacilitiesRtData;
