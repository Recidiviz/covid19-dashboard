import { EpidemicModelState } from "../impact-dashboard/EpidemicModelContext";

export type Facility = {
  name: string;
  model_inputs: EpidemicModelState;
};
