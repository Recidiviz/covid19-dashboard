import { Facility } from "../page-multi-facility/types";
import { FacilityMapping } from ".";

export const getFacilityById = (
  facilities: FacilityMapping,
  facilityId: Facility["id"] | null,
) => {
  return Object.values(facilities).find((f) => f.id === facilityId);
};
