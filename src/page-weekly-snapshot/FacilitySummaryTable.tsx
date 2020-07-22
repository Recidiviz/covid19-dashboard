import { get, pick, pickBy, sum, values } from "lodash";
import React from "react";

import {
  findMatchingDay,
  findMostRecentDate,
} from "../hooks/useAddCasesInputs";
import {
  caseBracketKeys,
  deathBracketKeys,
  populationKeys,
  recoveredBracketKeys,
} from "../impact-dashboard/EpidemicModelContext";
import { formatThousands } from "../impact-dashboard/ImpactProjectionTable";
import { Facility, ModelInputs } from "../page-multi-facility/types";
import { BorderDiv, HorizontalRule, Table } from "./FacilityPage";
import {
  COLUMN_SPACING,
  Delta,
  DELTA_DIRECTION_MAPPING,
  DeltaContainer,
  Left,
  Right,
  TextContainer,
} from "./shared/index";
import { makeTableHeadings } from "./shared/utils";

const VALUE_MAPPING = {
  cases: caseBracketKeys,
  deaths: deathBracketKeys,
  population: populationKeys,
  recovered: recoveredBracketKeys,
};

interface IncarceratedFacilitySummaryData {
  incarceratedPopulation: number;
  incarceratedPopulationDelta: number;
  incarceratedPopulationDeltaDirection: string;
  incarceratedCases: number;
  incarceratedCasesDelta: number;
  incarceratedCasesDeltaDirection: string;
}

interface StaffFacilitySummaryData {
  staffPopulation: number;
  staffPopulationDelta: number;
  staffPopulationDeltaDirection: string;
  staffCases: number;
  staffCasesDelta: number;
  staffCasesDeltaDirection: string;
}

interface FacilitySummaryData {
  incarceratedData: IncarceratedFacilitySummaryData;
  staffData: StaffFacilitySummaryData;
}

interface DeltaData {
  delta: number;
  deltaDirection: string;
}

function makeSummaryRow(total: number, deltaDirection: string, delta: number) {
  return (
    <TextContainer>
      <Left>{formatThousands(total)}</Left>
      <DeltaContainer>
        <Delta deltaDirection={deltaDirection}>
          {get(DELTA_DIRECTION_MAPPING, deltaDirection)}
        </Delta>
        <Right marginRight={COLUMN_SPACING}>{formatThousands(delta)}</Right>
      </DeltaContainer>
    </TextContainer>
  );
}

function makeSummaryColumns(facilitySummaryData: FacilitySummaryData) {
  return (
    <tr>
      <td>
        {makeSummaryRow(
          facilitySummaryData.incarceratedData.incarceratedPopulation,
          facilitySummaryData.incarceratedData
            .incarceratedPopulationDeltaDirection,
          facilitySummaryData.incarceratedData.incarceratedPopulationDelta,
        )}
      </td>
      <td>
        {makeSummaryRow(
          facilitySummaryData.incarceratedData.incarceratedCases,
          facilitySummaryData.incarceratedData.incarceratedCasesDeltaDirection,
          facilitySummaryData.incarceratedData.incarceratedCasesDelta,
        )}
      </td>
      <td>
        {makeSummaryRow(
          facilitySummaryData.staffData.staffPopulation,
          facilitySummaryData.staffData.staffPopulationDeltaDirection,
          facilitySummaryData.staffData.staffPopulationDelta,
        )}
      </td>
      <td>
        {makeSummaryRow(
          facilitySummaryData.staffData.staffCases,
          facilitySummaryData.staffData.staffCasesDeltaDirection,
          facilitySummaryData.staffData.staffCasesDelta,
        )}
      </td>
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

function buildStaffFacilitySummaryData(
  facility: Facility,
  mostRecentData: ModelInputs | undefined,
) {
  const staffCases = getTotalValues(facility.modelInputs, "cases", "staff");

  const staffRecoveredCases = getTotalValues(
    facility.modelInputs,
    "recovered",
    "staff",
  );

  const staffDeaths = getTotalValues(facility.modelInputs, "deaths", "staff");

  const staffPopulation = getTotalValues(
    facility.modelInputs,
    "population",
    "staff",
  );

  const staffActiveCases = getActiveCases(
    staffCases,
    staffRecoveredCases,
    staffDeaths,
  );

  let staffCasesDelta = {
    delta: 0,
    deltaDirection: "same",
  } as DeltaData;

  let staffPopulationDelta = {
    delta: 0,
    deltaDirection: "same",
  } as DeltaData;

  if (mostRecentData) {
    const mostRecentStaffCases = getTotalValues(
      mostRecentData,
      "cases",
      "staff",
    );

    const mostRecentStaffRecoveredCases = getTotalValues(
      mostRecentData,
      "recovered",
      "staff",
    );
    const mostRecentStaffDeaths = getTotalValues(
      mostRecentData,
      "deaths",
      "staff",
    );
    const mostRecentStaffPopulation = getTotalValues(
      mostRecentData,
      "population",
      "staff",
    );

    const mostRecentStaffActiveCases = getActiveCases(
      mostRecentStaffCases,
      mostRecentStaffRecoveredCases,
      mostRecentStaffDeaths,
    );

    staffCasesDelta = getDelta(mostRecentStaffActiveCases, staffActiveCases);

    staffPopulationDelta = getDelta(mostRecentStaffPopulation, staffPopulation);
  }

  const staffFacilitySummaryData: StaffFacilitySummaryData = {
    staffPopulation: staffPopulation,
    staffPopulationDelta: staffPopulationDelta.delta,
    staffPopulationDeltaDirection: staffPopulationDelta.deltaDirection,
    staffCases: staffActiveCases,
    staffCasesDelta: staffCasesDelta.delta,
    staffCasesDeltaDirection: staffCasesDelta.deltaDirection,
  };
  return staffFacilitySummaryData;
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

const FacilitySummaryTable: React.FC<{
  facility: Facility;
}> = ({ facility }) => {
  const hasEarlierData = facility.modelVersions.length > 1;
  let mostRecentData = undefined;

  if (hasEarlierData) {
    const currentDate = facility.updatedAt;
    const mostRecentDate = findMostRecentDate(
      currentDate,
      facility.modelVersions,
      false,
    );
    mostRecentData = findMatchingDay({
      date: mostRecentDate,
      facilityModelVersions: facility.modelVersions,
    });
  }

  const incarceratedSummaryData = buildIncarceratedFacilitySummaryData(
    facility,
    mostRecentData,
  );

  const staffSummaryData = buildStaffFacilitySummaryData(
    facility,
    mostRecentData,
  );

  const facilitySummaryData = {
    incarceratedData: incarceratedSummaryData,
    staffData: staffSummaryData,
  } as FacilitySummaryData;

  return (
    <Table>
      <thead>{makeTableHeadings()}</thead>
      <tbody>{makeSummaryColumns(facilitySummaryData)}</tbody>
    </Table>
  );
};

export default FacilitySummaryTable;
