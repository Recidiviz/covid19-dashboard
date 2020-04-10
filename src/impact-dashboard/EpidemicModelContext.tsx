import { csvParse, DSVRowAny } from "d3";
import { rollup } from "d3-array";
import { mapValues, pick } from "lodash";
import numeral from "numeral";
import React, { useEffect } from "react";

import useQueryParams, { QueryParams } from "../hooks/useQueryParams";

type CountyLevelRecord = {
  hospitalBeds: number;
  totalIncarceratedPopulation: number;
  estimatedIncarceratedCases: number;
  county: string;
  state: string;
};

type CountyLevelData = Map<string, Map<string, CountyLevelRecord>>;

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

// fields that we want to store in URL or other persistent store
interface ModelInputsPersistent {
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
  facilityDormitoryPct?: number;
  facilityOccupancyPct?: number;
  rateOfSpreadFactor?: RateOfSpread;
  staffCases?: number;
  staffPopulation?: number;
  plannedReleases?: PlannedReleases;
}

interface ModelInputsUpdate extends ModelInputsPersistent {
  // these don't persist because they are auto-populated from external data
  confirmedCases?: number;
  totalIncarcerated?: number;
  usePopulationSubsets?: boolean;
}
// some fields are required for calculations, define them here
interface EpidemicModelInputs extends ModelInputsUpdate {
  rateOfSpreadFactor: RateOfSpread;
  usePopulationSubsets: boolean;
  facilityDormitoryPct: number;
  facilityOccupancyPct: number;
}

interface MetadataPersistent {
  // fields that we want to store in URL or other persistent store
  countyName?: string;
  facilityName?: string;
  stateCode?: string;
}

interface MetadataUpdate extends MetadataPersistent {
  countyLevelData?: CountyLevelData;
  countyLevelDataLoading?: boolean;
  countyLevelDataFailed?: boolean;
  // this is not user input so don't store it
  hospitalBeds?: number;
}
// some fields are required to display a sensible UI, define them here
interface Metadata extends MetadataUpdate {
  stateCode: string;
  hospitalBeds: number;
}

type EpidemicModelPersistent = ModelInputsPersistent & MetadataPersistent;
// we have to type all them out here again
// but at least we can validate that none are illegal
// TODO: is there a smarter way to get these values?
export const urlParamKeys: Array<keyof EpidemicModelPersistent> = [
  "countyName",
  "facilityName",
  "stateCode",
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
  "facilityDormitoryPct",
  "facilityOccupancyPct",
  "rateOfSpreadFactor",
  "staffCases",
  "staffPopulation",
  "plannedReleases",
];

export type EpidemicModelUpdate = ModelInputsUpdate & MetadataUpdate;

type EpidemicModelState = EpidemicModelInputs & Metadata;

type EpidemicModelProviderProps = { children: React.ReactNode };

const EpidemicModelStateContext = React.createContext<
  EpidemicModelState | undefined
>(undefined);

const EpidemicModelDispatchContext = React.createContext<Dispatch | undefined>(
  undefined,
);

interface ResetPayload {
  dataSource?: CountyLevelData;
  stateCode?: string;
  countyName?: string;
}

function getLocaleData(
  dataSource: CountyLevelData,
  stateCode: string,
  countyName: string,
) {
  return {
    stateCode,
    countyName,
    countyLevelData: dataSource,
    countyLevelDataLoading: false,
    totalIncarcerated: dataSource.get(stateCode)?.get(countyName)
      ?.totalIncarceratedPopulation,
    hospitalBeds: dataSource.get(stateCode)?.get(countyName)?.hospitalBeds,
    ageUnknownPopulation: dataSource.get(stateCode)?.get(countyName)
      ?.totalIncarceratedPopulation,
    ageUnknownCases: dataSource.get(stateCode)?.get(countyName)
      ?.estimatedIncarceratedCases,
    confirmedCases: dataSource.get(stateCode)?.get(countyName)
      ?.estimatedIncarceratedCases,
    staffCases: 0,
    staffPopulation: 0,
  };
}

function getResetBase(stateCode = "US Total", countyName = "Total") {
  return {
    stateCode,
    countyName,
    rateOfSpreadFactor: RateOfSpread.high,
    // in the current UI we are always using age brackets
    // TODO: maybe this field is no longer needed?
    usePopulationSubsets: true,
    facilityOccupancyPct: 1,
    facilityDormitoryPct: 0.15,
    hospitalBeds: 0,
    countyLevelDataLoading: true,
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

      // change in state or county triggers a bigger reset
      let updates = { ...action.payload };
      let { stateCode, countyName, countyLevelData } = updates;

      countyLevelData = countyLevelData || state.countyLevelData;
      if (countyLevelData) {
        if (stateCode) {
          countyName = countyName || "Total";
        } else if (countyName) {
          stateCode = state.stateCode;
        }
        if (stateCode && countyName) {
          return Object.assign(
            getResetBase(stateCode, countyName),
            getLocaleData(countyLevelData, stateCode, countyName),
          );
        }
      }
      return Object.assign({}, state, updates);
  }
}

function sanitizeQueryParams(rawQueryParams: QueryParams) {
  return mapValues(pick(rawQueryParams, urlParamKeys), (value) => {
    // convert numeric values back to numbers
    const n = numeral(value).value();
    return n != null ? n : value;
  });
}

// estimated ratio of confirmed cases to actual cases
const caseReportingRate = 0.14;

function EpidemicModelProvider({ children }: EpidemicModelProviderProps) {
  const {
    values: rawQueryParams,
    replaceValues: replaceHistoryState,
  } = useQueryParams({});

  const [state, dispatch] = React.useReducer(
    epidemicModelReducer,
    getResetBase(),
  );

  useEffect(
    () => {
      // leave state alone until we are done loading data
      if (state.countyLevelDataLoading) {
        return;
      }
      replaceHistoryState(pick(state, urlParamKeys));
    },
    // replaceHistoryState changes on every render so must be excluded
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state],
  );

  // fetch from external datasource
  React.useEffect(
    () => {
      async function effect() {
        try {
          const response = await fetch(
            "https://docs.google.com/spreadsheets/d/e/2PACX-1vSeEO7JySaN21_Cxa7ON_x" +
              "UHDM-EEOFSMIjOAoLf6YOXBurMRXZYPFi7x_aOe-0awqDcL4KZTK1NhVI/pub?gid=" +
              "1836987932&single=true&output=csv",
          );
          let rawCSV = await response.text();
          // the first line is not the header row so we need to strip it
          rawCSV = rawCSV.substring(rawCSV.indexOf("\n") + 1);

          const parsedArray = csvParse(
            rawCSV,
            (row): CountyLevelRecord => {
              // we only need a few columns, which we will explicitly format

              // defaulting missing numbers to zero will not produce meaningful modeling
              // but it should at least prevent the UI from breaking;
              // users can still substitute their own values via form inputs
              const reportedCases: number = numeral(row.cases).value() || 0;
              const estimatedTotalCases: number =
                reportedCases * (1 / caseReportingRate);
              // TODO: distinguish jail vs prison?
              const totalIncarceratedPopulation: number =
                numeral(row["Total Incarcerated Population"]).value() || 0;
              const totalPopulation: number =
                numeral(row["Total Population"]).value() || 0;

              return {
                county: row.County || "",
                state: row.State || "",
                hospitalBeds: numeral(row["Hospital Beds"]).value() || 0,
                totalIncarceratedPopulation,
                estimatedIncarceratedCases: Math.round(
                  totalPopulation
                    ? (totalIncarceratedPopulation / totalPopulation) *
                        estimatedTotalCases
                    : 0,
                ),
              };
            },
          )
            // rows without County are known to be junk
            .filter((row) => row.county !== "");

          const nestedStateCounty = rollup(
            parsedArray,
            // there will only ever be one row object per county
            (v: object[]) => v[0],
            (d: DSVRowAny) => d.state as string,
            (d: DSVRowAny) => d.county as string,
            // some wrong/outdated typedefs for d3 are making typescript sad
            // but this should check out
          ) as CountyLevelData;

          let {
            stateCode: savedStateCode,
            countyName: savedCountyName,
            ...otherParams
          } = rawQueryParams;
          // state or county changes trigger a state reset
          // so we have to run them separately
          let { stateCode, countyName } = state;
          if (savedStateCode) {
            stateCode = savedStateCode as string;
            if (savedCountyName) {
              countyName = savedCountyName as string;
            }
          }
          dispatch({
            type: "update",
            payload: {
              countyLevelData: nestedStateCounty,
              countyLevelDataLoading: false,
              ...getLocaleData(
                nestedStateCounty,
                stateCode,
                countyName as string,
              ),
            },
          });
          dispatch({
            type: "update",
            payload: sanitizeQueryParams(otherParams),
          });
        } catch (error) {
          console.error(error);
          dispatch({
            type: "update",
            payload: { countyLevelDataFailed: true },
          });
        }
      }
      effect();
    },
    // we only want to run this once, on initial mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <EpidemicModelStateContext.Provider value={state}>
      <EpidemicModelDispatchContext.Provider value={dispatch}>
        {children}
      </EpidemicModelDispatchContext.Provider>
    </EpidemicModelStateContext.Provider>
  );
}

function useEpidemicModelState() {
  const context = React.useContext(EpidemicModelStateContext);

  if (context === undefined) {
    throw new Error(
      "useEpidemicModelState must be used within an EpidemicModelProvider",
    );
  }

  return context;
}

function useEpidemicModelDispatch() {
  const context = React.useContext(EpidemicModelDispatchContext);

  if (context === undefined) {
    throw new Error(
      "useEpidemicModelDispatch must be used within an EpidemicModelProvider",
    );
  }

  return context;
}

export {
  EpidemicModelProvider,
  useEpidemicModelState,
  useEpidemicModelDispatch,
  EpidemicModelInputs,
};
