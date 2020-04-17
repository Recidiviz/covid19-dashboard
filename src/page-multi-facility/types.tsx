import { EpidemicModelState } from "../impact-dashboard/EpidemicModelContext";

export type Facility = {
  name: string;
  modelInputs: EpidemicModelState;
};

export type Facilities = Facility[];
