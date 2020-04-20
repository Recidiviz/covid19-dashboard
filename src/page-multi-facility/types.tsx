import { EpidemicModelPersistent } from "../impact-dashboard/EpidemicModelContext";

export type Facility = {
  id?: string;
  name: string;
  systemType?: string;
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

export type Scenario = {
  name: string;
  baseline: boolean;
  dataSharing: boolean;
  dailyReports: boolean;
  showPromo: boolean;
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
