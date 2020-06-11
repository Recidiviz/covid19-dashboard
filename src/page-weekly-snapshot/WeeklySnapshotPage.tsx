import { maxBy, minBy, orderBy } from "lodash";
import numeral from "numeral";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { DateMMMMdyyyy } from "../design-system/DateFormats";
import InputSelect from "../design-system/InputSelect";
import Loading from "../design-system/Loading";
import {
  LocaleDataProvider,
  LocaleRecord,
  useLocaleDataState,
} from "../locale-data-context";
import {
  NYTCountyRecord,
  NYTData,
  NYTStateRecord,
  useNYTData,
} from "./NYTDataProvider";

const stateNamesFilter = (key: string) =>
  !["US Total", "US Federal Prisons"].includes(key);
const formatNumber = (number: number) => numeral(number).format("0,0");

const LocaleStats = styled.div`
  display: flex;
`;
const LocaleStatsList = styled.ul``;

type PerCapitaCountyCase = {
  name: string;
  perCapitaIncrease: number | undefined;
};

function getDay(nytData: NYTCountyRecord[] | NYTStateRecord[], day: number) {
  if (day === 1) {
    return minBy(nytData, (d: NYTCountyRecord | NYTStateRecord) => d.date);
  } else {
    return maxBy(nytData, (d: NYTCountyRecord | NYTStateRecord) => d.date);
  }
}

function getCountyDataByName(counties: NYTCountyRecord[]) {
  const dataByCounty: { [countyName: string]: NYTCountyRecord[] } = {};

  counties.forEach((data: NYTCountyRecord) => {
    if (dataByCounty[data.county]) {
      dataByCounty[data.county] = [...dataByCounty[data.county], data];
    } else {
      dataByCounty[data.county] = [data];
    }
  });

  return dataByCounty;
}

function calculatePerCapitaIncrease(
  daySevenCases: number | undefined,
  dayOneCases: number | undefined,
  countyPopulation: number | undefined,
) {
  if (
    (!daySevenCases && daySevenCases !== 0) ||
    (!dayOneCases && dayOneCases !== 0) ||
    !countyPopulation
  )
    return;
  return (daySevenCases - dayOneCases) / countyPopulation;
}

function getPerCapitaCountyCases(
  counties: NYTCountyRecord[],
  stateLocaleData: Map<string, LocaleRecord> | undefined,
) {
  const dataByCounty = getCountyDataByName(counties);
  const perCapitaCountyCases: PerCapitaCountyCase[] = [];

  for (const countyName in dataByCounty) {
    const dayOne = getDay(dataByCounty[countyName], 1);
    const daySeven = getDay(dataByCounty[countyName], 7);
    const countyPopulation = stateLocaleData?.get(countyName)?.totalPopulation;
    perCapitaCountyCases.push({
      name: countyName,
      perCapitaIncrease: calculatePerCapitaIncrease(
        daySeven?.cases,
        dayOne?.cases,
        countyPopulation,
      ),
    });
  }
  return perCapitaCountyCases;
}

export default function WeeklySnapshotPage() {
  const { data, loading: nytLoading } = useNYTData();
  const [selectedState, setSelectedState] = useState<NYTData | undefined>();
  const [sevenDayDiffInCases, setSevenDayDiffInCases] = useState<
    number | undefined
  >();
  const [countiesToWatch, setCountiesToWatch] = useState<string[] | undefined>(
    [],
  );
  const [totalBeds, setTotalBeds] = useState<number | undefined>();
  const { data: localeData, loading } = useLocaleDataState();
  const stateNames = Array.from(localeData.keys()).filter(stateNamesFilter);
  const handleOnChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const stateName = event.target.value;
    if (!nytLoading) {
      setSelectedState(data[stateName]);
    }
  };

  const dayOne = getDay(selectedState?.state || [], 1);
  const daySeven = getDay(selectedState?.state || [], 7);
  useEffect(() => {
    if (dayOne?.state && daySeven?.state && selectedState) {
      const stateLocaleData = localeData?.get(dayOne.state);
      const totalLocaleData = stateLocaleData?.get("Total");
      const sevenDayDiffInCases = daySeven.cases - dayOne.cases;
      const totalBeds =
        totalLocaleData &&
        totalLocaleData.icuBeds + totalLocaleData.hospitalBeds;

      const perCapitaCountyCases = getPerCapitaCountyCases(
        selectedState.counties,
        stateLocaleData,
      );
      const highestFourCounties = orderBy(
        perCapitaCountyCases.filter((c) => !!c.perCapitaIncrease),
        ["perCapitaIncrease"],
        ["desc"],
      ).slice(0, 4);
      const countiesToWatch = highestFourCounties.map((county) => {
        const starred =
          stateLocaleData && stateLocaleData.has(county.name) ? "***" : "";
        return `${county.name}${starred}, ${numeral(
          county.perCapitaIncrease,
        ).format("0.000 %")};`;
      });
      setCountiesToWatch(countiesToWatch);
      setTotalBeds(totalBeds);
      setSevenDayDiffInCases(sevenDayDiffInCases);
    }
  }, [selectedState, localeData]);

  return (
    <LocaleDataProvider>
      {loading || nytLoading ? (
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
          {selectedState && (
            <LocaleStats>
              <LocaleStatsList>
                <li>
                  Latest Date:{" "}
                  {daySeven?.date && <DateMMMMdyyyy date={daySeven.date} />}
                </li>
                <li>
                  Number of cases in the state:{" "}
                  {daySeven?.cases || daySeven?.cases === 0
                    ? formatNumber(daySeven.cases)
                    : "?"}
                </li>
                <li>
                  Change in state cases since last week:{" "}
                  {sevenDayDiffInCases || sevenDayDiffInCases === 0
                    ? formatNumber(sevenDayDiffInCases)
                    : "?"}
                </li>
                <li>
                  Number of ICU and hospital beds in state:{" "}
                  {totalBeds || totalBeds === 0 ? formatNumber(totalBeds) : "?"}
                </li>
                <li>Counties to watch: {countiesToWatch?.join(" ")}</li>
              </LocaleStatsList>
            </LocaleStats>
          )}
        </>
      )}
    </LocaleDataProvider>
  );
}
