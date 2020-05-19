import { EpidemicModelPersistent } from "../impact-dashboard/EpidemicModelContext";
import { RtData } from "../infection-model/rt";

export interface ModelInputs extends EpidemicModelPersistent {
  observedAt: Date;
  updatedAt: Date;
}

export type Facility = {
  id: string;
  scenarioId: string;
  name: string;
  description?: string;
  systemType?: string;
  modelInputs: ModelInputs;
  createdAt: Date;
  updatedAt: Date;
};

export type Facilities = Facility[];

export type Scenario = {
  id: string;
  name: string;
  baseline: boolean;
  dataSharing: boolean;
  dailyReports: boolean;
  promoStatuses: PromoStatuses;
  baselinePopulations: BaselinePopulations[];
  description: string;
  roles: object;
  createdAt: Date;
  updatedAt: Date;
};

export type PromoStatuses = {
  [promoType: string]: boolean;
  dailyReports: boolean;
  dataSharing: boolean;
  addFacilities: boolean;
};

export type RtDataMapping = {
  [key in Facility["id"]]: RtData | null;
};

export type BaselinePopulations = {
  date: Date;
  staffPopulation: number;
  incarceratedPopulation: number;
};
