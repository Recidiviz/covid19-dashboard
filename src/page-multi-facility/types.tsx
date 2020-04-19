import { EpidemicModelPersistent } from "../impact-dashboard/EpidemicModelContext";

export type Facility = {
  name: string;
  modelInputs: EpidemicModelPersistent;
};

export type Facilities = Facility[];

export type Scenario = {
  name: string;
  baseline: boolean;
  dataSharing: boolean;
  dailyReports: boolean;
  description: string;
  roles: Map<string, string>;
  createdAt: TimeStamp;
  updatedAt: TimeStamp;
};

type TimeStamp = {
  seconds: string;
  nanoseconds: string;
  toDate: () => string;
};
