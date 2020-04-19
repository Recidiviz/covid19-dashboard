import { EpidemicModelPersistent } from "../impact-dashboard/EpidemicModelContext";

export type Facility = {
  id?: string;
  name: string;
  modelInputs: EpidemicModelPersistent;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

type Timestamp = {
  seconds: string;
  nanoseconds: string;
  toDate: () => string;
};

export type Facilities = Facility[];
