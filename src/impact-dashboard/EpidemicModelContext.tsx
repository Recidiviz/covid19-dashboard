import { sum } from "d3";
import { pick } from "lodash";
import React from "react";

import { LocaleData } from "../locale-data-context";
import { Facility, ModelInputs } from "../page-multi-facility/types";

export type PlannedRelease = { date?: Date; count?: number };
export type PlannedReleases = PlannedRelease[];

type Action = { type: "update"; payload: EpidemicModelUpdate };
type Dispatch = (action: Action) => void;

export enum RateOfSpread {
  low = "low",
  moderate = "moderate",
  high = "high",
}
// any field that we can update via reducer should be here,
// and should probably be optional

// fields that we want to store
export interface ModelInputsPopulationBrackets {
  age0Cases?: number;
  age0Population?: number;
  age20Cases?: number;
  age20Population?: number;
  age45Cases?: number;
  age45Population?: number;
  age55Cases?: number;
  age55Population?: number;
  age65Cases?: number;
  age65Population?: number;
  age75Cases?: number;
  age75Population?: number;
  age85Cases?: number;
  age85Population?: number;
  ageUnknownCases?: number;
  ageUnknownPopulation?: number;
  staffCases?: number;
  staffPopulation?: number;
}

export const caseBracketKeys: Array<keyof ModelInputsPopulationBrackets> = [
  "age0Cases",
  "age20Cases",
  "age45Cases",
  "age55Cases",
  "age65Cases",
  "age75Cases",
  "age85Cases",
  "ageUnknownCases",
  "staffCases",
];

interface ModelInputsPersistent extends ModelInputsPopulationBrackets {
  facilityDormitoryPct?: number;
  facilityCapacity?: number;
  plannedReleases?: PlannedReleases;
  populationTurnover?: number;
  rateOfSpreadFactor?: RateOfSpread;
  observedAt?: Date;
  updatedAt?: Date;
}

interface ModelInputsUpdate extends ModelInputsPersistent {
  // these don't persist because they are auto-populated from external data
  confirmedCases?: number;
  totalIncarcerated?: number;
  usePopulationSubsets?: boolean;
}
// some fields are required for calculations, define them here
export interface EpidemicModelInputs extends ModelInputsUpdate {
  rateOfSpreadFactor: RateOfSpread;
  usePopulationSubsets: boolean;
  facilityDormitoryPct: number;
  populationTurnover: number;
}

interface MetadataPersistent {
  // fields that we want to store
  countyName?: string;
  stateName?: string;
}

// some fields are required to display a sensible UI, define them here
interface Metadata extends MetadataPersistent {
  hospitalBeds: number;
  stateName: string;
}

export type EpidemicModelPersistent = ModelInputsPersistent &
  MetadataPersistent;

// we have to type all them out here again
// but at least we can validate that none are illegal
// TODO: is there a smarter way to get these values?
export const populationBracketKeys: Array<
  keyof ModelInputsPopulationBrackets
> = [
  "age0Cases",
  "age0Population",
  "age20Cases",
  "age20Population",
  "age45Cases",
  "age45Population",
  "age55Cases",
  "age55Population",
  "age65Cases",
  "age65Population",
  "age75Cases",
  "age75Population",
  "age85Cases",
  "age85Population",
  "ageUnknownCases",
  "ageUnknownPopulation",
  "staffCases",
  "staffPopulation",
];
export const persistedKeys: Array<keyof EpidemicModelPersistent> = [
  ...populationBracketKeys,
  "countyName",
  "stateName",
  "facilityDormitoryPct",
  "facilityCapacity",
  "plannedReleases",
  "populationTurnover",
  "rateOfSpreadFactor",
  "observedAt",
  "updatedAt",
];

export type EpidemicModelUpdate = ModelInputsUpdate & MetadataPersistent;

export type EpidemicModelState = EpidemicModelInputs &
  Metadata & {
    localeDataSource: LocaleData;
  };

type EpidemicModelProviderProps = {
  children: React.ReactNode;
  facilityModel?: EpidemicModelPersistent;
  localeDataSource: LocaleData;
};

const EpidemicModelStateContext = React.createContext<
  EpidemicModelState | undefined
>(undefined);

const EpidemicModelDispatchContext = React.createContext<Dispatch | undefined>(
  undefined,
);

interface ResetPayload {
  dataSource?: LocaleData;
  stateName?: string;
  countyName?: string;
}

export function getLocaleDefaults(
  dataSource: LocaleData,
  stateName = "US Total",
  countyName = "Total",
) {
  return {
    // metadata
    countyName,
    stateName,
    localeDataSource: dataSource,
    // in the current UI we are always using age brackets
    // TODO: maybe this field is no longer needed?
    usePopulationSubsets: true,
    // read-only locale data
    confirmedCases:
      dataSource.get(stateName)?.get(countyName)?.reportedCases || 0,
    hospitalBeds: dataSource.get(stateName)?.get(countyName)?.hospitalBeds || 0,
    totalIncarcerated:
      dataSource.get(stateName)?.get(countyName)?.totalIncarceratedPopulation ||
      0,
    totalPrisonPopulation:
      dataSource.get(stateName)?.get(countyName)?.totalPrisonPopulation || 0,
    totalJailPopulation:
      dataSource.get(stateName)?.get(countyName)?.totalJailPopulation || 0,
    // user input defaults
    rateOfSpreadFactor: RateOfSpread.high,
    facilityDormitoryPct: 0.15,
    populationTurnover: 0,
  };
}

function epidemicModelReducer(
  state: EpidemicModelState,
  action: Action,
): EpidemicModelState {
  switch (action.type) {
    case "update":
      // the desired user flow is to fill out a form, review the entries,
      // then submit it all at once; therefore we can just expose a single
      // action and merge the whole object into previous state.
      // it's not very granular but it doesn't need to be at the moment

      let updates = { ...action.payload };
      let { stateName, countyName } = updates;

      // change in state or county triggers a bigger reset
      if (stateName) {
        countyName = countyName || "Total";
      } else if (countyName) {
        stateName = state.stateName;
      }
      if (stateName && countyName) {
        return getLocaleDefaults(state.localeDataSource, stateName, countyName);
      }

      return Object.assign({}, state, updates);
  }
}

export function EpidemicModelProvider({
  children,
  facilityModel,
  localeDataSource,
}: EpidemicModelProviderProps) {
  const initialState = {
    ...getLocaleDefaults(
      localeDataSource,
      facilityModel?.stateName,
      facilityModel?.countyName,
    ),
    ...(facilityModel || {}),
  };

  const [state, dispatch] = React.useReducer(
    epidemicModelReducer,
    initialState,
  );

  return (
    <EpidemicModelStateContext.Provider value={state}>
      <EpidemicModelDispatchContext.Provider value={dispatch}>
        {children}
      </EpidemicModelDispatchContext.Provider>
    </EpidemicModelStateContext.Provider>
  );
}

export function useEpidemicModelState() {
  const context = React.useContext(EpidemicModelStateContext);

  if (context === undefined) {
    throw new Error(
      "useEpidemicModelState must be used within an EpidemicModelProvider",
    );
  }

  return context;
}

export function useEpidemicModelDispatch() {
  const context = React.useContext(EpidemicModelDispatchContext);

  if (context === undefined) {
    throw new Error(
      "useEpidemicModelDispatch must be used within an EpidemicModelProvider",
    );
  }

  return context;
}

// *******
// calculation helpers
// *******

const incarceratedCasesKeys: (keyof ModelInputsPopulationBrackets)[] = [
  "age0Cases",
  "age20Cases",
  "age45Cases",
  "age55Cases",
  "age65Cases",
  "age75Cases",
  "age85Cases",
  "ageUnknownCases",
];
const casesKeys: (keyof ModelInputsPopulationBrackets)[] = [
  ...incarceratedCasesKeys,
  "staffCases",
];

const incarceratedPopulationKeys: (keyof ModelInputsPopulationBrackets)[] = [
  "age0Population",
  "age20Population",
  "age45Population",
  "age55Population",
  "age65Population",
  "age75Population",
  "age85Population",
  "ageUnknownPopulation",
];

const populationKeys: (keyof ModelInputsPopulationBrackets)[] = [
  ...incarceratedPopulationKeys,
  "staffPopulation",
];

export function totalConfirmedCases(
  brackets: ModelInputsPopulationBrackets,
): number {
  return sum(Object.values(pick(brackets, casesKeys)));
}

export function totalIncarceratedConfirmedCases(
  brackets: ModelInputsPopulationBrackets,
): number {
  return sum(Object.values(pick(brackets, incarceratedCasesKeys)));
}

export function totalIncarceratedPopulation(
  brackets: ModelInputsPopulationBrackets,
): number {
  return sum(Object.values(pick(brackets, incarceratedPopulationKeys)));
}

export function totalPopulation(
  brackets: ModelInputsPopulationBrackets,
): number {
  return sum([totalIncarceratedPopulation(brackets), brackets.staffPopulation]);
}

export function sumAgeGroupPopulations(facility: Facility): number {
  return totalIncarceratedPopulation(facility.modelInputs);
}

export function calculateFacilityOccupancyPct(
  userInputs: EpidemicModelInputs,
): number {
  const { facilityCapacity } = userInputs;

  return facilityCapacity
    ? totalIncarceratedPopulation(userInputs) / facilityCapacity
    : 1;
}

export function hasCases(inputs: ModelInputsPopulationBrackets) {
  return casesKeys.some((key) => inputs[key] !== undefined);
}

export function hasPopulation(inputs: ModelInputs) {
  return populationKeys.some((key) => inputs[key] !== undefined);
}
