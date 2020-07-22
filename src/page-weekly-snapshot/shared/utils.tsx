import { get, pick, pickBy, sum, values } from "lodash";
import React from "react";

import {
  caseBracketKeys,
  deathBracketKeys,
  populationKeys,
  recoveredBracketKeys,
} from "../../impact-dashboard/EpidemicModelContext";
import { Facility, ModelInputs } from "../../page-multi-facility/types";
import {
  BorderDiv,
  COLUMN_SPACING,
  HorizontalRule,
  LeftHeading,
  TableHeading,
} from ".";

export interface IncarceratedFacilitySummaryData {
  incarceratedPopulation: number;
  incarceratedPopulationDelta: number;
  incarceratedPopulationDeltaDirection: string;
  incarceratedCases: number;
  incarceratedCasesDelta: number;
  incarceratedCasesDeltaDirection: string;
}

export interface DeltaData {
  delta: number;
  deltaDirection: string;
}

const VALUE_MAPPING = {
  cases: caseBracketKeys,
  deaths: deathBracketKeys,
  population: populationKeys,
  recovered: recoveredBracketKeys,
};

export function makeTableHeadings() {
  return (
    <tr>
      <TableHeading>
        <BorderDiv marginRight={COLUMN_SPACING} />
        <LeftHeading>Incarcerated population</LeftHeading>
        <HorizontalRule marginRight={COLUMN_SPACING} />
      </TableHeading>
      <TableHeading>
        <BorderDiv marginRight={COLUMN_SPACING} />
        <LeftHeading>Incarcerated cases</LeftHeading>
        <HorizontalRule marginRight={COLUMN_SPACING} />
      </TableHeading>
      <TableHeading>
        <BorderDiv marginRight={COLUMN_SPACING} />
        <LeftHeading>Staff population</LeftHeading>
        <HorizontalRule marginRight={COLUMN_SPACING} />
      </TableHeading>
      <TableHeading>
        <BorderDiv marginRight={COLUMN_SPACING} />
        <LeftHeading>Staff cases</LeftHeading>
        <HorizontalRule marginRight={COLUMN_SPACING} />
      </TableHeading>
    </tr>
  );
}

function getActiveCases(
  totalCases: number,
  recoveredCases: number,
  deaths: number,
) {
  if (totalCases <= recoveredCases + deaths) {
    return totalCases;
  }
  return totalCases - recoveredCases - deaths;
}

function getTotalValues(
  modelInputs: ModelInputs,
  value: string,
  startsWithFilter = "age",
) {
  let result = 0;
  const valueKeys = get(VALUE_MAPPING, value);
  const allData = pick(modelInputs, valueKeys);
  const data = pickBy(allData, (value, key) =>
    key.startsWith(startsWithFilter),
  );
  result += sum(values(data));
  return result;
}

function getDelta(earlierData: number, currentData: number) {
  const delta = currentData - earlierData;
  const deltaDirection =
    delta > 0 ? "positive" : delta < 0 ? "negative" : "same";
  const deltaData: DeltaData = {
    delta: Math.abs(delta),
    deltaDirection: deltaDirection,
  };
  return deltaData;
}

export function buildIncarceratedFacilitySummaryData(
  facility: Facility,
  mostRecentData: ModelInputs | undefined,
) {
  const incarceratedCases = getTotalValues(facility.modelInputs, "cases");
  const incarceratedRecoveredCases = getTotalValues(
    facility.modelInputs,
    "recovered",
  );
  const incarceratedDeaths = getTotalValues(facility.modelInputs, "deaths");

  const incarceratedPopulation = getTotalValues(
    facility.modelInputs,
    "population",
  );

  const incarceratedActiveCases = getActiveCases(
    incarceratedCases,
    incarceratedRecoveredCases,
    incarceratedDeaths,
  );

  let incarceratedCasesDelta = {
    delta: 0,
    deltaDirection: "same",
  } as DeltaData;

  let incarceratedPopulationDelta = {
    delta: 0,
    deltaDirection: "same",
  } as DeltaData;

  if (mostRecentData) {
    const mostRecentIncarceratedCases = getTotalValues(mostRecentData, "cases");
    const mostRecentIncarceratedRecoveredCases = getTotalValues(
      mostRecentData,
      "recovered",
    );
    const mostRecentIncarceratedDeaths = getTotalValues(
      mostRecentData,
      "deaths",
    );
    const mostRecentIncarceratedPopulation = getTotalValues(
      mostRecentData,
      "population",
    );

    const mostRecentIncarceratedActiveCases = getActiveCases(
      mostRecentIncarceratedCases,
      mostRecentIncarceratedRecoveredCases,
      mostRecentIncarceratedDeaths,
    );

    incarceratedCasesDelta = getDelta(
      mostRecentIncarceratedActiveCases,
      incarceratedActiveCases,
    );

    incarceratedPopulationDelta = getDelta(
      mostRecentIncarceratedPopulation,
      incarceratedPopulation,
    );
  }
  const incarceratedFacilitySummaryData: IncarceratedFacilitySummaryData = {
    incarceratedPopulation: incarceratedPopulation,
    incarceratedPopulationDelta: incarceratedPopulationDelta.delta,
    incarceratedPopulationDeltaDirection:
      incarceratedPopulationDelta.deltaDirection,
    incarceratedCases: incarceratedActiveCases,
    incarceratedCasesDelta: incarceratedCasesDelta.delta,
    incarceratedCasesDeltaDirection: incarceratedCasesDelta.deltaDirection,
  };
  return incarceratedFacilitySummaryData;
}
