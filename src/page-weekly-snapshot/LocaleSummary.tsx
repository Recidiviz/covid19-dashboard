import { sum } from "d3-array";
import { maxBy, minBy, orderBy } from "lodash";
import numeral from "numeral";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

import Colors, { MarkColors as markColors } from "../design-system/Colors";
import { DateMMMMdyyyy } from "../design-system/DateFormats";
import InputSelect from "../design-system/InputSelect";
import Loading from "../design-system/Loading";
import { Column, PageContainer } from "../design-system/PageColumn";
import {
  LocaleData,
  LocaleDataProvider,
  LocaleRecord,
  useLocaleDataState,
} from "../locale-data-context";
import { Facility } from "../page-multi-facility/types";
import LocaleSummaryTable from "./LocaleSummaryTable";
import {
  NYTCountyRecord,
  NYTData,
  NYTStateRecord,
  useNYTData,
} from "./NYTDataProvider";

const POPULATION_SIZE = 100000;

const stateNamesFilter = (key: string) =>
  !["US Total", "US Federal Prisons"].includes(key);
const formatNumber = (number: number) => numeral(number).format("0,0");

const LocaleStats = styled.div`
  display: flex;
`;
const LocaleStatsList = styled.ul``;

type PerCapitaCountyCase = {
  name: string;
  casesIncreasePerCapita: number | undefined;
};

type StateMetrics = {
  stateName: string;
  casesPerCapita: number | undefined;
  deathsPerCapita: number | undefined;
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

function getPerCapita(
  numerator: number | undefined,
  denominator: number | undefined,
) {
  let result = 0;
  if (numerator && denominator) {
    result = Math.round((numerator / denominator) * POPULATION_SIZE);
  }
  return result;
}

function getCurrentStateData(stateMetrics: StateMetrics[], stateName: string) {
  for (let i = 0; i < stateMetrics.length; i++) {
    if (stateMetrics[i].stateName === stateName) {
      return stateMetrics[i];
    }
  }
  return undefined;
}

function getAllStateData(localeData: LocaleData, stateNames: string[]) {
  const stateMetrics: StateMetrics[] = [];
  // D.C. isn't a state!
  stateNames = stateNames.filter((item) => item !== "District of Columbia");

  for (let i = 0; i < stateNames.length; i++) {
    const localeDataStateTotal = localeData?.get(stateNames[i])?.get("Total");
    // console.log(localeDataStateTotal);
    if (localeDataStateTotal) {
      const totalCases = localeDataStateTotal["reportedCases"];
      const totalPopulation = localeDataStateTotal["totalPopulation"];
      const totalDeaths = localeDataStateTotal["totalDeaths"];
      const casesPerCapita = getPerCapita(totalCases, totalPopulation);
      const deathsPerCapita = getPerCapita(totalDeaths, totalPopulation);
      stateMetrics.push({
        stateName: stateNames[i],
        casesPerCapita: casesPerCapita,
        deathsPerCapita: deathsPerCapita,
      });
    }
  }
  return stateMetrics;
}

function getStateTotalCasesRank(
  stateTotals: StateMetrics[],
  selectedState: string | undefined,
) {
  const rankedStates = orderBy(
    stateTotals.filter((c) => !!c.casesPerCapita),
    ["casesPerCapita"],
    ["desc"],
  );

  for (let i = 0; i < rankedStates.length; i++) {
    const currState = rankedStates[i];
    if (
      selectedState &&
      currState.stateName === selectedState &&
      currState.casesPerCapita
    ) {
      return [currState.casesPerCapita, i + 1];
    }
  }
  return [undefined, undefined];
}

function getStateTotalDeathsRank(
  stateTotals: StateMetrics[],
  selectedState: string | undefined,
) {
  const rankedStates = orderBy(
    stateTotals.filter((c) => !!c.deathsPerCapita),
    ["deathsPerCapita"],
    ["desc"],
  );

  for (let i = 0; i < rankedStates.length; i++) {
    const currState = rankedStates[i];
    if (
      selectedState &&
      currState.stateName === selectedState &&
      currState.deathsPerCapita
    ) {
      return [currState.deathsPerCapita, i + 1];
    }
  }
  return [undefined, undefined];
}

function getCountyIncreasePerCapita(
  counties: NYTCountyRecord[],
  stateLocaleData: Map<string, LocaleRecord> | undefined,
) {
  const dataByCounty = getCountyDataByName(counties);
  const countyCasesIncreasePerCapita: PerCapitaCountyCase[] = [];

  for (const countyName in dataByCounty) {
    const dayOne = getDay(dataByCounty[countyName], 1);
    const daySeven = getDay(dataByCounty[countyName], 7);
    const countyPopulation = stateLocaleData?.get(countyName)?.totalPopulation;
    countyCasesIncreasePerCapita.push({
      name: countyName,
      casesIncreasePerCapita: calculatePerCapitaIncrease(
        daySeven?.cases,
        dayOne?.cases,
        countyPopulation,
      ),
    });
  }
  return countyCasesIncreasePerCapita;
}

function getTotalIncarceratedPopulation(facilities: Facility[]) {
  let result = 0;
  let hasPopulationData = true;
  for (let i = 0; i < facilities.length; i++) {
    const {
      ageUnknownPopulation,
      age0Population,
      age20Population,
      age45Population,
      age55Population,
      age65Population,
      age75Population,
      age85Population,
    } = facilities[i].modelInputs;
    let ageKnownCaseData = [
      ageUnknownPopulation,
      age0Population,
      age20Population,
      age45Population,
      age55Population,
      age65Population,
      age75Population,
      age85Population,
    ];
    ageKnownCaseData = ageKnownCaseData.filter((data) => data !== undefined);
    // TODO: user has no case data
    if (ageKnownCaseData.length === 0) {
      hasPopulationData = false;
    }
    result += sum(ageKnownCaseData);
  }
  return result;
}

function getTotalIncarceratedCases(facilities: Facility[]) {
  let result = 0;
  let hasCaseData = true;
  for (let i = 0; i < facilities.length; i++) {
    const {
      ageUnknownCases,
      age0Cases,
      age20Cases,
      age45Cases,
      age55Cases,
      age65Cases,
      age75Cases,
      age85Cases,
    } = facilities[i].modelInputs;
    let ageKnownCaseData = [
      ageUnknownCases,
      age0Cases,
      age20Cases,
      age45Cases,
      age55Cases,
      age65Cases,
      age75Cases,
      age85Cases,
    ];
    ageKnownCaseData = ageKnownCaseData.filter((data) => data !== undefined);
    // TODO: user has no case data
    if (ageKnownCaseData.length === 0) {
      hasCaseData = false;
    }
    result += sum(ageKnownCaseData);
  }
  return result;
}

function getTotalIncarceratedDeaths(facilities: Facility[]) {
  let result = 0;
  let hasDeathData = true;
  for (let i = 0; i < facilities.length; i++) {
    const {
      ageUnknownDeaths,
      age0Deaths,
      age20Deaths,
      age45Deaths,
      age55Deaths,
      age65Deaths,
      age75Deaths,
      age85Deaths,
    } = facilities[i].modelInputs;
    let ageKnownCaseData = [
      ageUnknownDeaths,
      age0Deaths,
      age20Deaths,
      age45Deaths,
      age55Deaths,
      age65Deaths,
      age75Deaths,
      age85Deaths,
    ];
    ageKnownCaseData = ageKnownCaseData.filter((data) => data !== undefined);
    // TODO: user has no case data
    if (ageKnownCaseData.length === 0) {
      hasDeathData = false;
    }
    result += sum(ageKnownCaseData);
  }
  return result;
}

export default function LocaleSummary() {
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
    if (dayOne?.stateName && daySeven?.stateName && selectedState) {
      const stateLocaleData = localeData?.get(dayOne.stateName);
      const totalLocaleData = stateLocaleData?.get("Total");
      const sevenDayDiffInCases = daySeven.cases - dayOne.cases;
      const totalBeds =
        totalLocaleData &&
        totalLocaleData.icuBeds + totalLocaleData.hospitalBeds;

      const perCapitaCountyCases = getCountyIncreasePerCapita(
        selectedState.counties,
        stateLocaleData,
      );
      const highestFourCounties = orderBy(
        perCapitaCountyCases.filter((c) => !!c.casesIncreasePerCapita),
        ["casesIncreasePerCapita"],
        ["desc"],
      ).slice(0, 4);
      const countiesToWatch = highestFourCounties.map((county) => {
        return `${county.name}, ${numeral(county.casesIncreasePerCapita).format(
          "0.000 %",
        )};`;
      });

      setCountiesToWatch(countiesToWatch);
      setTotalBeds(totalBeds);
      setSevenDayDiffInCases(sevenDayDiffInCases);
    }
  }, [selectedState, localeData, dayOne, daySeven]);
  return (
    <LocaleDataProvider>
      {loading || nytLoading ? (
        <Loading />
      ) : (
        <PageContainer>
          <Column>
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
                    {totalBeds || totalBeds === 0
                      ? formatNumber(totalBeds)
                      : "?"}
                  </li>
                  {/* <li>Counties to watch: {countiesToWatch?.join(" ")}</li>
                <li>cases per capita: {casesPerCapita}</li>
                <li>cases per capita rank: {casesPerCapitaRank}</li>
                <li>deaths per capita: {deathsPerCapita}</li>
                <li>deaths per capita rank : {deathsPerCapitaRank}</li>
                <li>incarcerated cases per capita: {incarceratedCasesPerCapita}</li>
                <li>incarcerated deaths per capita: {incarceratedDeathsPerCapita}</li>                */}
                </LocaleStatsList>
              </LocaleStats>
            )}
          </Column>
          <Column>
            <LocaleSummaryTable
              stateName={selectedState?.state[0].stateName}
              stateNames={stateNames}
            />
          </Column>
        </PageContainer>
      )}
    </LocaleDataProvider>
  );
}
