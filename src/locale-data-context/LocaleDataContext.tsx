import { csvParse, DSVRowAny } from "d3";
import { rollup } from "d3-array";
import numeral from "numeral";
import React from "react";

import { CLOUD_FUNCTION_URL_BASE } from "../constants";

export type LocaleRecord = {
  county: string;
  totalPopulation: number;
  estimatedIncarceratedCases: number;
  hospitalBeds: number;
  reportedCases: number;
  stateName: string;
  totalIncarceratedPopulation: number;
  icuBeds: number;
  totalPrisonPopulation?: number;
  totalJailPopulation?: number;
  totalDeaths?: number;
};

export type LocaleData = Map<string, Map<string, LocaleRecord>>;

type LocaleDataUpdate = {
  loading?: boolean;
  failed?: boolean;
  data?: LocaleData;
};

type LocaleDataState = {
  loading: boolean;
  failed: boolean;
  data: LocaleData;
};

type Action = { type: "update"; payload: LocaleDataUpdate };
type Dispatch = (action: Action) => void;

// estimated ratio of confirmed cases to actual cases
const caseReportingRate = 0.14;

const StateContext = React.createContext<LocaleDataState | undefined>(
  undefined,
);

const DispatchContext = React.createContext<Dispatch | undefined>(undefined);

function localeReducer(
  state: LocaleDataState,
  action: Action,
): LocaleDataState {
  switch (action.type) {
    case "update":
      return Object.assign({}, state, action.payload);
  }
}

export const LocaleDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = React.useReducer(localeReducer, {
    loading: true,
    failed: false,
    data: new Map(),
  });

  // fetch from external datasource
  React.useEffect(
    () => {
      async function effect() {
        try {
          const response = await fetch(
            `${CLOUD_FUNCTION_URL_BASE}/getLocaleData`,
          );
          let rawCSV = await response.text();
          // the first line is not the header row so we need to strip it
          rawCSV = rawCSV.substring(rawCSV.indexOf("\n") + 1);

          const parsedArray = csvParse(rawCSV, (row):
            | LocaleRecord
            | undefined => {
            // rows without these fields are known to be junk; we filter these out below
            if (!row.County || !row.State) {
              return undefined;
            }
            // we only need a few columns, which we will explicitly format

            // defaulting missing numbers to zero will not produce meaningful modeling
            // but it should at least prevent the UI from breaking;
            // users can still substitute their own values via form inputs
            const reportedCases: number = numeral(row.cases).value() || 0;
            const estimatedTotalCases: number =
              reportedCases * (1 / caseReportingRate);
            const totalPrisonPopulation: number = numeral(
              row["Prison Population"],
            ).value();
            const totalJailPopulation: number = numeral(
              row["Jail Population (2017)"],
            ).value();
            const totalIncarceratedPopulation: number =
              numeral(row["Total Incarcerated Population"]).value() || 0;
            const totalPopulation: number =
              numeral(row["Total Population"]).value() || 0;
            const totalDeaths: number = numeral(row["deaths"]).value() || 0;

            return {
              county: row.County,
              stateName: row.State,
              totalPopulation: totalPopulation,
              hospitalBeds: numeral(row["Hospital Beds"]).value() || 0,
              totalIncarceratedPopulation,
              reportedCases,
              estimatedIncarceratedCases: Math.round(
                totalPopulation
                  ? (totalIncarceratedPopulation / totalPopulation) *
                      estimatedTotalCases
                  : 0,
              ),
              icuBeds: numeral(row["ICU Beds"]).value() || 0,
              ...(totalPrisonPopulation && { totalPrisonPopulation }),
              ...(totalJailPopulation && { totalJailPopulation }),
              totalDeaths: totalDeaths,
            };
          }).filter((row) => row !== undefined);

          const nestedStateCounty: LocaleData = rollup(
            parsedArray,
            // there will only ever be one row object per county
            (v: object[]) => v[0],
            (d: DSVRowAny) => d.stateName as string,
            (d: DSVRowAny) => d.county as string,
            // some wrong/outdated typedefs for d3 are making typescript sad
            // but this should check out
          ) as LocaleData;

          dispatch({
            type: "update",
            payload: {
              data: nestedStateCounty,
              loading: false,
            },
          });
        } catch (error) {
          console.error(error);
          dispatch({
            type: "update",
            payload: { failed: true },
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
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
};

export function useLocaleDataState() {
  const context = React.useContext(StateContext);
  if (context === undefined) {
    throw new Error(
      "useLocaleDataState must be used within a LocaleDataProvider",
    );
  }

  return context;
}

export function useLocaleDataDispatch() {
  const context = React.useContext(DispatchContext);

  if (context === undefined) {
    throw new Error(
      "useLocaleDataDispatch must be used within a LocaleDataProvider",
    );
  }

  return context;
}
