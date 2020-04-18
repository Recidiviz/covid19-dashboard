import { EpidemicModelPersistent } from "../impact-dashboard/EpidemicModelContext";

export type Facility = {
  id?: string;
  name: string;
  modelInputs: EpidemicModelPersistent;
};

export type Facilities = Facility[];
