import React from "react";

import { Facility } from "./types";

export const FacilityContext = React.createContext<Facility | undefined>(
  undefined,
);
