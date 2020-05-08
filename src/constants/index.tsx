import { Facilities } from "../page-multi-facility/types";

// Date Format Constants
export const MMMD = "MMM d";
export const MMMMdyyyy = "MMMM d, yyyy";

export type FetchedFacilities = {
  data: Facilities;
  loading: boolean;
};
