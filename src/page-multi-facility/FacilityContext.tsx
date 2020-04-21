import React from "react";

import { Facility } from "./types";

interface FacilityContextProps {
  facility?: Facility;
  setFacility?: any;
}

export const FacilityContext = React.createContext<FacilityContextProps>({
  facility: undefined,
  setFacility: undefined,
});
