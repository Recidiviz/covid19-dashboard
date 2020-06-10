import { csvParse, DSVRowAny, DSVRowString } from "d3";
import { subWeeks } from "date-fns";
import numeral from "numeral";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

import InputSelect from "../design-system/InputSelect";
import Loading from "../design-system/Loading";
import { LocaleDataProvider, useLocaleDataState } from "../locale-data-context";

function transformRow(row: DSVRowString) {
  return {
    ...row,
    cases: numeral(row["cases"]).value() || 0,
    confirmedCases: numeral(row["confirmed_cases"]).value() || 0,
    confirmedDeaths: numeral(row["confirmed_deaths"]).value() || 0,
    deaths: numeral(row["deaths"]).value() || 0,
    probableCases: numeral(row["probable_cases"]).value() || 0,
    probableDeaths: numeral(row["probable_deaths"]).value() || 0,
  };
}

const stateNamesFilter = (key: string) =>
  !["US Total", "US Federal Prisons"].includes(key);
const formatNumber = (number: number) => numeral(number).format("0,0");

const LocaleStats = styled.div`
  display: flex;
`;
const LocaleStatsList = styled.ul``;

export default function WeeklySnapshotPage() {
  const [latestStatesData, setLatestStatesData] = useState<DSVRowAny[]>([]);
  const [latestCountyData, setLatestCountyData] = useState<DSVRowAny[]>([]);
  const [historicalStatesData, setHistoricalStatesData] = useState<DSVRowAny[]>(
    [],
  );
  const [historicalCountyData, setHistoricalCountyData] = useState<DSVRowAny[]>(
    [],
  );
  const [stateData, setStateData] = useState<DSVRowAny>({});
  const { data: localeData, loading } = useLocaleDataState();
  const stateNames = Array.from(localeData.keys()).filter(stateNamesFilter);

  useEffect(() => {
    async function fetchLatestNYTStatesData() {
      const latestStatesDataURL =
        "https://raw.githubusercontent.com/nytimes/covid-19-data/master/live/us-states.csv";
      const response = await fetch(latestStatesDataURL);
      const rawCSV = await response.text();
      const data = csvParse(rawCSV, transformRow);
      setLatestStatesData(data);
    }

    async function fetchLatestNYTCountyData() {
      const latestCountyDataURL =
        "https://raw.githubusercontent.com/nytimes/covid-19-data/master/live/us-counties.csv";
      const response = await fetch(latestCountyDataURL);
      const rawCSV = await response.text();
      const data = csvParse(rawCSV, transformRow);
      setLatestCountyData(data);
    }

    async function fetchHistoricalNYTStatesData() {
      const historicalStatesDataURL =
        "https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv";

      const response = await fetch(historicalStatesDataURL);
      const rawCSV = await response.text();
      const data = csvParse(rawCSV, transformRow);
      setHistoricalStatesData(data);
    }

    async function fetchHistoricalNYTCountyData() {
      const historicalCountyDataURL =
        "https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv";

      const response = await fetch(historicalCountyDataURL);
      const rawCSV = await response.text();
      const data = csvParse(rawCSV, transformRow);
      setHistoricalCountyData(data);
    }

    fetchLatestNYTStatesData();
    fetchLatestNYTCountyData();
    fetchHistoricalNYTStatesData();
    fetchHistoricalNYTCountyData();
  }, [setStateData]);

  console.log("state data: ", {
    stateData,
    latestStatesData,
    localeData,
    stateNames,
    historicalStatesData,
    historicalCountyData,
    latestCountyData,
  });
  console.log(new Date(stateData.date), subWeeks(new Date(stateData.date), 1));

  const handleOnChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const stateName = event.target.value;
    if (latestStatesData.length) {
      const stateData = latestStatesData.find(
        (state) => state.state === stateName,
      );
      stateData && setStateData(stateData);
    }
  };

  // PSEUDOCODE STEPS
  // getSevenDayDiff
  // getDates
  // get dayOne - latestStatesData date - 7 days
  // get daySeven - latestStatesData date
  // getCasesDiff - daySeven cases - dayOne cases
  //
  // number of ICU/hospital beds in state (localeData)
  // add *** if county has a facility (cross reference with LocaleData)
  // counties to watch - fetch county data

  return (
    <LocaleDataProvider>
      {loading || !latestStatesData.length ? (
        <Loading />
      ) : (
        <>
          <InputSelect
            label="State"
            placeholder="Select a state"
            onChange={handleOnChange}
          >
            <option value="">Select a state</option>
            {stateNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </InputSelect>
          {stateData.state && (
            <LocaleStats>
              <LocaleStatsList>
                <li>
                  Number of cases in the state: {formatNumber(stateData.cases)}
                </li>
                <li>
                  Change in state cases since last week:{" "}
                  {formatNumber(stateData.cases)}
                </li>
                <li>Number of ICU and hospital beds in state: </li>
                <li>Counties to watch: </li>
              </LocaleStatsList>
            </LocaleStats>
          )}
        </>
      )}
    </LocaleDataProvider>
  );
}
