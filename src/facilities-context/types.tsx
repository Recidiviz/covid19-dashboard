import { Facility, ReferenceFacility } from "../page-multi-facility/types";

export type FacilityMapping = { [key in Facility["id"]]: Facility };

export type ReferenceFacilityMapping = {
  [key in ReferenceFacility["id"]]: ReferenceFacility;
};
