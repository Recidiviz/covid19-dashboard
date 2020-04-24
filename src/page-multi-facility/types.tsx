import { EpidemicModelPersistent } from "../impact-dashboard/EpidemicModelContext";

export type Facility = {
  id?: string;
  name: string;
  description: string;
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
  promoStatuses?: PromoStatuses | undefined;
  description: string;
  roles: object;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type PromoStatuses = {
  [promoType: string]: boolean;
  dailyReports: boolean;
  dataSharing: boolean;
  addFacilities: boolean;
};
