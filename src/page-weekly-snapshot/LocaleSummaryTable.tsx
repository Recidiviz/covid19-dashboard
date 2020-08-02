import { sum } from "d3-array";
import { get, keys, omit, orderBy, pick, values } from "lodash";
import React from "react";

import { Column, PageContainer } from "../design-system/PageColumn";
import { useFacilities } from "../facilities-context";
import {
  caseBracketKeys,
  deathBracketKeys,
  incarceratedPopulationKeys,
} from "../impact-dashboard/EpidemicModelContext";
import { formatThousands } from "../impact-dashboard/ImpactProjectionTable";
import { LocaleData, useLocaleDataState } from "../locale-data-context";
import { Facility } from "../page-multi-facility/types";
import { HorizontalRule, ValueDescription } from "./shared";
import StatsTable, { StatsTableRow } from "./shared/StatsTable";

type StateMetrics = {
  stateName: string;
  casesRate: number | undefined;
  deathsRate: number | undefined;
};

type IncarceratedData = {
  incarceratedData: number;
  hasData: boolean;
};

type StateRank = {
  stateRate: number;
  stateRank: number;
};

const RATE_UNIT = 100000;
const NUM_STATES = 50;

const VALUE_MAPPING = {
  deaths: deathBracketKeys,
  cases: caseBracketKeys,
  population: incarceratedPopulationKeys,
};

function formatOrdinal(value: number) {
  let suffix = ["th", "st", "nd", "rd"],
    rem = value % 100;
  return value + (suffix[(rem - 20) % 10] || suffix[rem] || suffix[0]);
}

function getRate(
  numerator: number | undefined,
  denominator: number | undefined,
) {
  let result = 0;
  if (numerator && denominator) {
    result = Math.round((numerator / denominator) * RATE_UNIT);
  }
  return result;
}

function getAllStateData(localeData: LocaleData, stateNames: string[]) {
  const stateMetrics: StateMetrics[] = [];
  // D.C. isn't a state!
  stateNames = stateNames.filter((item) => item !== "District of Columbia");

  for (let i = 0; i < stateNames.length; i++) {
    const localeDataStateTotal = localeData?.get(stateNames[i])?.get("Total");
    if (localeDataStateTotal) {
      const totalCases = localeDataStateTotal["reportedCases"];
      const totalPopulation = localeDataStateTotal["totalPopulation"];
      const totalDeaths = localeDataStateTotal["totalDeaths"];
      const casesRate = getRate(totalCases, totalPopulation);
      const deathsRate = getRate(totalDeaths, totalPopulation);
      stateMetrics.push({
        stateName: stateNames[i],
        casesRate: casesRate,
        deathsRate: deathsRate,
      });
    }
  }
  return stateMetrics;
}

function getStateRank(
  stateTotals: StateMetrics[],
  selectedStateName: string | undefined,
  filterValue: string,
) {
  const rankedStates = orderBy(
    stateTotals.filter((c) => !!get(c, filterValue)),
    [filterValue],
    ["asc"],
  );

  let selectedStateRate = 0;
  let selectedStateRank = 0;

  for (let i = 0; i < rankedStates.length; i++) {
    const currState = rankedStates[i];
    const currStateDataRate = get(currState, filterValue);
    if (
      selectedStateName &&
      currState.stateName === selectedStateName &&
      currStateDataRate
    ) {
      selectedStateRate = currStateDataRate;
      selectedStateRank = i + 1;
    }
  }

  const stateRank: StateRank = {
    stateRank: selectedStateRank,
    stateRate: selectedStateRate,
  };
  return stateRank;
}

function getTotalIncarceratedValue(facilities: Facility[], value: string) {
  let result = 0;
  let hasData = false;
  const valueKeys = get(VALUE_MAPPING, value);
  for (let i = 0; i < facilities.length; i++) {
    const modelInputs = facilities[i].modelInputs;
    const data = omit(
      pick(modelInputs, valueKeys),
      "staffDeaths",
      "staffRecovered",
      "staffCases",
    );
    if (keys(data).length > 0) {
      hasData = true;
    }
    result += sum(values(data));
  }
  const incarceratedData: IncarceratedData = {
    incarceratedData: result,
    hasData: hasData,
  };
  return incarceratedData;
}

const LocaleSummaryTable: React.FC<{
  stateName: string | undefined;
  stateNames: string[];
}> = ({ stateName, stateNames }) => {
  const localeState = useLocaleDataState();
  const localeData = localeState.data;
  const {
    state: { facilities: facilitiesState },
  } = useFacilities();
  const facilities = Object.values(facilitiesState);

  let casesRate = 0;
  let casesRateRank = 0;

  let deathsRate = 0;
  let deathsRateRank = 0;

  let incarceratedCasesRate = 0;
  let incarceratedDeathsRate = 0;

  let hasCaseData = true;
  let hasDeathData = true;

  const allStateMetrics = getAllStateData(localeData, stateNames);

  if (stateName) {
    const selectedStateCasesRank = getStateRank(
      allStateMetrics,
      stateName,
      "casesRate",
    );

    casesRate = selectedStateCasesRank.stateRate;
    casesRateRank = selectedStateCasesRank.stateRank;

    const selectedStateDeathsRank = getStateRank(
      allStateMetrics,
      stateName,
      "deathsRate",
    );

    deathsRate = selectedStateDeathsRank.stateRate;
    deathsRateRank = selectedStateDeathsRank.stateRank;

    const totalIncarceratedCases = getTotalIncarceratedValue(
      facilities,
      "cases",
    );
    const totalIncarceratedDeaths = getTotalIncarceratedValue(
      facilities,
      "deaths",
    );
    const totalIncarceratedPopulation = getTotalIncarceratedValue(
      facilities,
      "population",
    );
    incarceratedCasesRate = getRate(
      totalIncarceratedCases.incarceratedData,
      totalIncarceratedPopulation.incarceratedData,
    );
    hasCaseData = totalIncarceratedCases.hasData;
    incarceratedDeathsRate = getRate(
      totalIncarceratedDeaths.incarceratedData,
      totalIncarceratedPopulation.incarceratedData,
    );
    hasDeathData = totalIncarceratedDeaths.hasData;
  }

  const NO_DATA = "No data";

  const casesTableData = [
    {
      header: "Incarcerated Cases",
      subheader: "(per 100k)",
      value: hasCaseData ? formatThousands(incarceratedCasesRate) : NO_DATA,
    },
    {
      header: "Overall State Cases",
      subheader: "(per 100k)",
      value: formatThousands(casesRate),
      valueDescription: (
        <ValueDescription>
          {formatOrdinal(casesRateRank)} lowest of {NUM_STATES}
        </ValueDescription>
      ),
    },
  ];

  const fatalitiesTableData = [
    {
      header: "Incarcerated Fatalities",
      subheader: "(per 100k)",
      value: hasDeathData ? formatThousands(incarceratedDeathsRate) : NO_DATA,
    },
    {
      header: "Overall State Fatalities",
      subheader: "(per 100k)",
      value: formatThousands(deathsRate),
      valueDescription: (
        <ValueDescription>
          {formatOrdinal(deathsRateRank)} lowest of {NUM_STATES}
        </ValueDescription>
      ),
    },
  ];

  return (
    <>
      <PageContainer>
        <Column>
          <HorizontalRule />
          <StatsTable header="Cases">
            {casesTableData.map((tableData, index) => (
              <StatsTableRow
                key={`Cases__StatsTableRow--${index}`}
                columns={[tableData]}
              />
            ))}
          </StatsTable>
        </Column>
        <Column>
          <HorizontalRule />
          <StatsTable header="Fatalities">
            {fatalitiesTableData.map((tableData, index) => (
              <StatsTableRow
                key={`Fatalities__StatsTableRow--${index}`}
                columns={[tableData]}
              />
            ))}
          </StatsTable>
        </Column>
      </PageContainer>
    </>
  );
};

export default LocaleSummaryTable;
