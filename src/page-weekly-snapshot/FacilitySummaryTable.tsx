import { get, omit, pick, pickBy, sum, values } from "lodash";
import React from "react";
import styled from "styled-components";

import { Column, PageContainer } from "../design-system/PageColumn";
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
import { BorderDiv, HorizontalRule } from "./FacilityPage";

const VALUE_MAPPING = {
  cases: caseBracketKeys,
  deaths: deathBracketKeys,
  population: populationKeys,
  recovered: recoveredBracketKeys,
};

const DELTA_DIRECTION_MAPPING = {
  positive: "↑ ",
  negative: "↓ ",
  same: "↑ ",
};

const TextContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
`;

const Right = styled.div`
  text-align: right;
  font-family: "Libre Baskerville";
  font-size: 17px;
`;

const DeltaContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const Left = styled.div`
  text-align: left;
  font-family: "Libre Franklin";
  font-size: 11px;
`;

// TODO: use standard colors
const Delta = styled.div<{ deltaDirection?: string }>`
  color: ${(props) =>
    props.deltaDirection == "positive"
      ? "#cb2500"
      : props.deltaDirection == "negative"
      ? "#006c67"
      : "#c8d3d3"};
`;

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

function makeSummaryRow(
  heading: string,
  total: number,
  deltaDirection: string,
  delta: number,
) {
  return (
    <>
      <BorderDiv marginRight={"0px"} />
      {heading}
      <HorizontalRule />
      <TextContainer>
        <Right>{formatThousands(total)}</Right>
        <DeltaContainer>
          <Delta deltaDirection={deltaDirection}>
            {get(DELTA_DIRECTION_MAPPING, deltaDirection)}
          </Delta>
          <Left>{formatThousands(delta)}</Left>
        </DeltaContainer>
      </TextContainer>
    </>
  );
}

function makeSummaryColumns(facilitySummaryData: FacilitySummaryData) {
  return (
    <>
      <Column>
        {makeSummaryRow(
          "Incarcerated Population",
          facilitySummaryData.incarceratedData.incarceratedPopulation,
          facilitySummaryData.incarceratedData
            .incarceratedPopulationDeltaDirection,
          facilitySummaryData.incarceratedData.incarceratedPopulationDelta,
        )}
      </Column>
      <Column>
        {makeSummaryRow(
          "Incarcerated Cases",
          facilitySummaryData.incarceratedData.incarceratedCases,
          facilitySummaryData.incarceratedData.incarceratedCasesDeltaDirection,
          facilitySummaryData.incarceratedData.incarceratedCasesDelta,
        )}
      </Column>
      <Column>
        {makeSummaryRow(
          "Staff Population",
          facilitySummaryData.staffData.staffPopulation,
          facilitySummaryData.staffData.staffPopulationDeltaDirection,
          facilitySummaryData.staffData.staffPopulationDelta,
        )}
      </Column>
      <Column>
        {makeSummaryRow(
          "Staff Cases",
          facilitySummaryData.staffData.staffCases,
          facilitySummaryData.staffData.staffCasesDeltaDirection,
          facilitySummaryData.staffData.staffCasesDelta,
        )}
      </Column>
    </>
  );
}

function getTotalIncarceratedValues(modelInputs: ModelInputs, value: string) {
  let result = 0;
  const valueKeys = get(VALUE_MAPPING, value);
  const data = omit(
    pick(modelInputs, valueKeys),
    "staffDeaths",
    "staffRecovered",
    "staffCases",
  );
  result += sum(values(data));
  return result;
}

function getTotalStaffValues(modelInputs: ModelInputs, value: string) {
  let result = 0;
  const valueKeys = get(VALUE_MAPPING, value);
  const allData = pick(modelInputs, valueKeys);
  const data = pickBy(allData, (value, key) => key.startsWith("staff"));
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

function buildStaffFacilitySummaryData(facility: Facility) {
  const hasEarlierData = facility.modelVersions.length > 1;
  const staffCases = getTotalStaffValues(facility.modelInputs, "cases");

  const staffRecoveredCases = getTotalStaffValues(
    facility.modelInputs,
    "recovered",
  );

  const staffDeaths = getTotalStaffValues(facility.modelInputs, "deaths");

  const staffPopulation = getTotalStaffValues(
    facility.modelInputs,
    "population",
  );

  const staffActiveCases = staffCases - staffRecoveredCases - staffDeaths;

  let staffCasesDelta = {
    delta: 0,
    deltaDirection: "same",
  } as DeltaData;

  let staffPopulationDelta = {
    delta: 0,
    deltaDirection: "same",
  } as DeltaData;

  if (hasEarlierData) {
    const currentDate = facility.updatedAt;
    const mostRecentDate = findMostRecentDate(
      currentDate,
      facility.modelVersions,
    );
    const mostRecentData = findMatchingDay({
      date: mostRecentDate,
      facilityModelVersions: facility.modelVersions,
    });
    if (mostRecentData) {
      const mostRecentStaffCases = getTotalStaffValues(mostRecentData, "cases");
      const mostRecentStaffRecoveredCases = getTotalStaffValues(
        mostRecentData,
        "recovered",
      );
      const mostRecentStaffDeaths = getTotalStaffValues(
        mostRecentData,
        "deaths",
      );
      const mostRecentStaffPopulation = getTotalStaffValues(
        mostRecentData,
        "population",
      );

      const mostRecentStaffActiveCases =
        mostRecentStaffCases -
        mostRecentStaffRecoveredCases -
        mostRecentStaffDeaths;

      staffCasesDelta = getDelta(mostRecentStaffActiveCases, staffActiveCases);

      staffPopulationDelta = getDelta(
        mostRecentStaffPopulation,
        staffPopulation,
      );
    }
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

function buildIncarceratedFacilitySummaryData(facility: Facility) {
  const hasEarlierData = facility.modelVersions.length > 1;

  const incarceratedCases = getTotalIncarceratedValues(
    facility.modelInputs,
    "cases",
  );
  const incarceratedRecoveredCases = getTotalIncarceratedValues(
    facility.modelInputs,
    "recovered",
  );
  const incarceratedDeaths = getTotalIncarceratedValues(
    facility.modelInputs,
    "deaths",
  );

  const incarceratedPopulation = getTotalIncarceratedValues(
    facility.modelInputs,
    "population",
  );

  const incarceratedActiveCases =
    incarceratedCases - incarceratedRecoveredCases - incarceratedDeaths;

  console.log(
    facility.name,
    incarceratedActiveCases,
    incarceratedRecoveredCases,
    incarceratedDeaths,
    incarceratedPopulation,
  );

  let incarceratedCasesDelta = {
    delta: 0,
    deltaDirection: "same",
  } as DeltaData;

  let incarceratedPopulationDelta = {
    delta: 0,
    deltaDirection: "same",
  } as DeltaData;

  if (hasEarlierData) {
    const currentDate = facility.updatedAt;
    const mostRecentDate = findMostRecentDate(
      currentDate,
      facility.modelVersions,
    );
    const mostRecentData = findMatchingDay({
      date: mostRecentDate,
      facilityModelVersions: facility.modelVersions,
    });
    if (mostRecentData) {
      const mostRecentIncarceratedCases = getTotalIncarceratedValues(
        mostRecentData,
        "cases",
      );
      const mostRecentIncarceratedRecoveredCases = getTotalIncarceratedValues(
        mostRecentData,
        "recovered",
      );
      const mostRecentIncarceratedDeaths = getTotalIncarceratedValues(
        mostRecentData,
        "deaths",
      );
      const mostRecentIncarceratedPopulation = getTotalIncarceratedValues(
        mostRecentData,
        "population",
      );

      const mostRecentIncarceratedActiveCases =
        mostRecentIncarceratedCases -
        mostRecentIncarceratedRecoveredCases -
        mostRecentIncarceratedDeaths;

      console.log(
        facility.name,
        mostRecentIncarceratedActiveCases,
        mostRecentIncarceratedRecoveredCases,
        mostRecentIncarceratedDeaths,
        mostRecentIncarceratedPopulation,
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
  const incarceratedSummaryData = buildIncarceratedFacilitySummaryData(
    facility,
  );

  const staffSummaryData = buildStaffFacilitySummaryData(facility);

  const facilitySummaryData = {
    incarceratedData: incarceratedSummaryData,
    staffData: staffSummaryData,
  } as FacilitySummaryData;

  return (
    <PageContainer>{makeSummaryColumns(facilitySummaryData)}</PageContainer>
  );
};

export default FacilitySummaryTable;
