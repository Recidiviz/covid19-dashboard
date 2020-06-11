import { csvParse, DSVRowString } from "d3";
import { isSameDay, parse, startOfToday, subWeeks } from "date-fns";
import numeral from "numeral";
import React, { useEffect, useState } from "react";

export type NYTStateRecord = {
  date: Date;
  state: string | undefined;
  cases: number;
  deaths: number;
  confirmedCases?: number;
  confirmedDeaths?: number;
  probableCases?: number;
  probableDeaths?: number;
};

export type NYTCountyRecord = NYTStateRecord & {
  county: string;
};

export type NYTData = {
  state: NYTStateRecord[];
  counties: NYTCountyRecord[];
};

type NYTDataMapping = {
  [stateName: string]: NYTData;
};

interface NYTDataContext {
  loading: boolean;
  error: any;
  data: NYTDataMapping;
}

const NYTDataContext = React.createContext<NYTDataContext | undefined>(
  undefined,
);

function transformRow(row: DSVRowString): NYTCountyRecord | NYTStateRecord {
  return {
    state: row.state,
    county: row.county,
    date: row.date ? parse(row.date, "yyyy-MM-dd", new Date()) : startOfToday(),
    cases: numeral(row["cases"]).value() || 0,
    confirmedCases: numeral(row["confirmed_cases"]).value() || 0,
    confirmedDeaths: numeral(row["confirmed_deaths"]).value() || 0,
    deaths: numeral(row["deaths"]).value() || 0,
    probableCases: numeral(row["probable_cases"]).value() || 0,
    probableDeaths: numeral(row["probable_deaths"]).value() || 0,
  };
}

async function fetchCSVData(url: string) {
  const response = await fetch(url);
  const rawCSV = await response.text();
  return csvParse(rawCSV, transformRow);
}

async function fetchLatestNYTCountyData() {
  const latestCountyDataURL =
    "https://raw.githubusercontent.com/nytimes/covid-19-data/master/live/us-counties.csv";
  return fetchCSVData(latestCountyDataURL);
}

async function fetchHistoricalNYTCountyData() {
  const historicalCountyDataURL =
    "https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv";
  return fetchCSVData(historicalCountyDataURL);
}

async function fetchLatestNYTStatesData() {
  const latestStatesDataURL =
    "https://raw.githubusercontent.com/nytimes/covid-19-data/master/live/us-states.csv";
  return fetchCSVData(latestStatesDataURL);
}

async function fetchHistoricalNYTStatesData() {
  const historicalStatesDataURL =
    "https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv";
  return fetchCSVData(historicalStatesDataURL);
}

export const NYTDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState({
    loading: false,
    error: null,
    data: {},
  });

  async function fetchNYTData() {
    const [
      latestCountyData,
      historicalCountyData,
      latestStateData,
      historicalStateData,
    ] = await Promise.all([
      fetchLatestNYTCountyData(),
      fetchHistoricalNYTCountyData(),
      fetchLatestNYTStatesData(),
      fetchHistoricalNYTStatesData(),
    ]);

    const dayOne = latestStateData[0].date;
    const daySeven = subWeeks(dayOne, 1);
    const filteredCountyData = historicalCountyData.filter((d) =>
      isSameDay(d.date, daySeven),
    );
    const filteredStateData = historicalStateData.filter((d) =>
      isSameDay(d.date, daySeven),
    );
    let data: { [key: string]: any } = {};
    for (const stateData of latestStateData) {
      if (stateData.state) {
        data[stateData.state] = {
          state: [
            stateData,
            ...filteredStateData.filter((d) => d.state === stateData.state),
          ],
          counties: [
            ...latestCountyData.filter((d) => d.state === stateData.state),
            ...filteredCountyData.filter((d) => d.state === stateData.state),
          ],
        };
      }
    }
    return data;
  }

  useEffect(() => {
    let mounted = true;
    setState({ data: {}, error: null, loading: true });
    fetchNYTData()
      .then((data) => {
        if (mounted) {
          setState({
            error: null,
            data,
            loading: false,
          });
        }
      })
      .catch((error) => {
        if (mounted) {
          setState({
            data: {},
            loading: false,
            error,
          });
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <NYTDataContext.Provider value={state}>{children}</NYTDataContext.Provider>
  );
};

export function useNYTData() {
  const context = React.useContext(NYTDataContext);
  if (context === undefined) {
    throw new Error("useNYTDataProvider must be used within a NYTDataProvider");
  }

  return context;
}
