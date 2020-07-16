import { get, omit, pick, pickBy, startsWith, sum, values } from "lodash";
import React from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
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

const Delta = styled.div<{ deltaDirection?: string }>`
  color: ${(props) =>
    props.deltaDirection == "positive"
      ? Colors.red
      : props.deltaDirection == "negative"
      ? Colors.green
      : Colors.gray};
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

  const staffActiveCases = staffCases - staffRecoveredCases - staffDeaths;

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

    const mostRecentStaffActiveCases =
      mostRecentStaffCases -
      mostRecentStaffRecoveredCases -
      mostRecentStaffDeaths;

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

function buildIncarceratedFacilitySummaryData(
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

  const incarceratedActiveCases =
    incarceratedCases - incarceratedRecoveredCases - incarceratedDeaths;

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

    const mostRecentIncarceratedActiveCases =
      mostRecentIncarceratedCases -
      mostRecentIncarceratedRecoveredCases -
      mostRecentIncarceratedDeaths;

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
    <PageContainer>{makeSummaryColumns(facilitySummaryData)}</PageContainer>
  );
};

export default FacilitySummaryTable;
