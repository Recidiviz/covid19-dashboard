import { EpidemicModelPersistent } from "../impact-dashboard/EpidemicModelContext";

export type Facility = {
  name: string;
  modelInputs: EpidemicModelPersistent;
};

export type Facilities = Facility[];
