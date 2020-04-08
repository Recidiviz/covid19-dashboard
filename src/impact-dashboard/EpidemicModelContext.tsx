import camelcaseKeys from "camelcase-keys";
import { autoType, csvParse, DSVRowAny } from "d3";
import { rollup } from "d3-array";
import numeral from "numeral";
import React from "react";

type CountyLevelRecord = {
  hospitalBeds: number;
  totalIncarceratedPopulation: number;
  [propName: string]: any;
};

type CountyLevelData = Map<string, Map<string, CountyLevelRecord>>;

type Action = { type: "update"; payload: EpidemicModelUpdate };
type Dispatch = (action: Action) => void;

export type RateOfSpread = "low" | "moderate" | "high";
// any field that we can update via reducer should be here,
// and should probably be optional
interface ModelInputsUpdate {
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
  confirmedCases?: number;
  facilityDormitoryPct?: number;
  facilityOccupancyPct?: number;
  rateOfSpreadFactor?: RateOfSpread;
  staffCases?: number;
  staffPopulation?: number;
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

interface MetadataUpdate {
  countyLevelData?: CountyLevelData;
  countyLevelDataLoading?: boolean;
  countyLevelDataFailed?: boolean;
  countyName?: string;
  facilityName?: string;
  stateCode?: string;
  hospitalBeds?: number;
}
// some fields are required to display a sensible UI, define them here
interface Metadata extends MetadataUpdate {
  stateCode: string;
  hospitalBeds: number;
}

type EpidemicModelUpdate = ModelInputsUpdate & MetadataUpdate;

type EpidemicModelState = EpidemicModelInputs & Metadata;

type EpidemicModelProviderProps = { children: React.ReactNode };

const EpidemicModelStateContext = React.createContext<
  EpidemicModelState | undefined
>(undefined);

const EpidemicModelDispatchContext = React.createContext<Dispatch | undefined>(
  undefined,
);

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
      return Object.assign({}, state, action.payload);
  }
}

function EpidemicModelProvider({ children }: EpidemicModelProviderProps) {
  const [state, dispatch] = React.useReducer(epidemicModelReducer, {
    stateCode: "US Total",
    countyName: "Total",
    countyLevelDataLoading: true,
    rateOfSpreadFactor: "high",
    usePopulationSubsets: false,
    facilityOccupancyPct: 1,
    facilityDormitoryPct: 0.15,
    hospitalBeds: 0,
  });

  // fetch from external datasource
  React.useEffect(() => {
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

        const parsedArray = csvParse(rawCSV, (row) => {
          const transformedRow = autoType(row);
          // autotype won't catch formatted thousands and percentages,
          // so run them through numeral
          Object.entries(transformedRow).forEach(([key, value]) => {
            if (value && typeof value === "string") {
              const transformedValue = numeral(value).value();
              transformedRow[key] =
                transformedValue === null ? value : transformedValue;
            }
          });

          return transformedRow;
        })
          // rows without County are known to be junk
          .filter((row) => !!row.County);

        const nestedStateCounty = rollup(
          parsedArray,
          // there will only ever be one row object per county
          (v: object[]) => camelcaseKeys(v[0]),
          (d: DSVRowAny) => d.State as string,
          (d: DSVRowAny) => d.County as string,
          // some wrong/outdated typedefs for d3 are making typescript sad
          // but this should check out
        ) as CountyLevelData;

        dispatch({
          type: "update",
          payload: {
            countyLevelData: nestedStateCounty,
            stateCode: "US Total",
            countyName: "Total",
            totalIncarcerated: nestedStateCounty.get("US Total")?.get("Total")
              ?.totalIncarceratedPopulation,
            hospitalBeds: nestedStateCounty.get("US Total")?.get("Total")
              ?.hospitalBeds,
            countyLevelDataLoading: false,
          },
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
  }, []);

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
