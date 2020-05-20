import { pick } from "lodash";
import { useEffect } from "react";

import { Facilities, RtDataMapping } from "../page-multi-facility/types";
import useFetchRtDataForFacility from "./useFetchRtDataForFacility";

export function getFacilitiesRtDataById(
  rtData: RtDataMapping | undefined,
  facilities: Facilities,
) {
  if (!rtData) return null;
  const facilityIds = facilities.map((f) => f.id);
  return pick(rtData, facilityIds);
}

const useFacilitiesRtData = (facilities: Facilities | null) => {
  const fetchRtDataForFacility = useFetchRtDataForFacility();

  useEffect(() => {
    if (facilities) {
      facilities.map(fetchRtDataForFacility);
    }
  }, [facilities, fetchRtDataForFacility]);
};

export default useFacilitiesRtData;
