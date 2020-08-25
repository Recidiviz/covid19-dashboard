import { referenceFacilitiesProp } from "../database";
import { EpidemicModelPersistent } from "../impact-dashboard/EpidemicModelContext";
import { RtData, RtError } from "../infection-model/rt";

export interface ModelInputs extends EpidemicModelPersistent {
  observedAt: Date;
  updatedAt?: Date;
  isReference?: boolean;
}

export type FacilityReferenceMapping = {
  [key in Facility["id"]]: ReferenceFacility["id"];
};

export interface PersistedFacility {
  name: string;
  description?: string | null;
  systemType?: string | null;
  modelInputs: ModelInputs;
  createdAt: Date;
  updatedAt: Date;
}
// only the keys enumerated here should be saved to the database
export const PERSISTED_FACILITY_KEYS: (keyof PersistedFacility)[] = [
  "name",
  "description",
  "systemType",
  "modelInputs",
  "createdAt",
  "updatedAt",
];

export type Facility = PersistedFacility & {
  id: string;
  scenarioId: string;
  modelVersions: ModelInputs[];
  canonicalName?: string;
};

export type Facilities = Facility[];

export type Scenario = {
  id: string;
  name: string;
  baseline: boolean;
  dataSharing: boolean;
  dailyReports: boolean;
  useReferenceData?: boolean;
  promoStatuses: PromoStatuses;
  baselinePopulations: BaselinePopulations[];
  [referenceFacilitiesProp]: FacilityReferenceMapping;
  description: string;
  roles: {
    [key: string]: "owner" | "viewer";
  };
  referenceDataObservedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type PromoStatuses = {
  [promoType: string]: boolean;
  dailyReports: boolean;
  dataSharing: boolean;
  addFacilities: boolean;
  newModelInputs: boolean;
};

export type RtValue = RtData | RtError | undefined;

export type RtDataMapping = {
  [key in Facility["id"]]: RtValue;
};

export type BaselinePopulations = {
  date: Date;
  staffPopulation: number;
  incarceratedPopulation: number;
};

export type User = {
  id: string;
  name: string;
  email: string;
};

export type ScenarioUsers = {
  owner: User | null | undefined;
  viewers: User[];
};

export type SimpleTimeseries = {
  date: Date;
  value: number;
};

export type ReferenceFacilityCovidCase = {
  observedAt: Date;
  popTested?: number;
  popTestedPositive?: number;
  popTestedNegative?: number;
  popDeaths?: number;
  staffTested?: number;
  staffTestedPositive?: number;
  staffTestedNegative?: number;
  staffDeaths?: number;
};

export type ReferenceFacility = {
  id: string;
  stateName: string;
  countyName?: string;
  canonicalName: string;
  facilityType: string;
  capacity: SimpleTimeseries[];
  population: SimpleTimeseries[];
  covidCases: ReferenceFacilityCovidCase[];
  createdAt: Date;
};
