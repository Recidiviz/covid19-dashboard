import { useContext, useEffect } from "react";

import { getRtDataForFacility } from "../infection-model/rt";
import { FacilityContext } from "../page-multi-facility/FacilityContext";
import { Facilities } from "../page-multi-facility/types";

const useFacilitiesRtData = (facilities: Facilities | null, useRt = false) => {
  const { rtData, dispatchRtData } = useContext(FacilityContext);

  async function getRtDataForFacilities(facilities: Facilities) {
    return await Promise.all(
      [...facilities].map(async (facility) => {
        // don't fetch data if we already have it
        if (rtData && rtData.hasOwnProperty(facility.id)) return;

        const facilityRtData = await getRtDataForFacility(facility);
        dispatchRtData({
          type: "add",
          payload: { [facility.id]: facilityRtData },
        });
      }),
    );
  }

  useEffect(
    () => {
      if (facilities && useRt) {
        getRtDataForFacilities(facilities);
      }
    },
    // omitting dispatchRtData because it's not a stable reference,
    // due to being initialized inside SiteProvider.
    // TODO: may change as part of #163
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [facilities, useRt],
  );
};

export default useFacilitiesRtData;
