import { get, omit, pick, sum, values } from "lodash";
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
  incarceratedPopulationKeys,
  recoveredBracketKeys,
} from "../impact-dashboard/EpidemicModelContext";
import { formatThousands } from "../impact-dashboard/ImpactProjectionTable";
import { Facility, ModelInputs } from "../page-multi-facility/types";
import { BorderDiv, HorizontalRule } from "./FacilityPage";

const VALUE_MAPPING = {
  cases: caseBracketKeys,
  deaths: deathBracketKeys,
  population: incarceratedPopulationKeys,
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

interface FacilitySummaryData {
  incarceratedPopulation: number;
  incarceratedPopulationDelta: number;
  incarceratedPopulationDeltaDirection: string;
  incarceratedCases: number;
  incarceratedCasesDelta: number;
  incarceratedCasesDeltaDirection: string;
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
        {makeSummaryRow("Incarcerated Population", 15687, "positive", 25)}
      </Column>
      <Column>
        {makeSummaryRow(
          "Incarcerated Cases",
          facilitySummaryData.incarceratedCases,
          facilitySummaryData.incarceratedCasesDeltaDirection,
          facilitySummaryData.incarceratedCasesDelta,
        )}
      </Column>
      <Column>
        <BorderDiv marginRight={"0px"} />
        Staff Population
        <HorizontalRule />
      </Column>
      <Column>
        <BorderDiv marginRight={"0px"} />
        Staff Cases
        <HorizontalRule />
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

function buildFacilitySummaryData(facility: Facility) {
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

  let delta = 0;
  let deltaDirection = "same";

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
      const mostRecentIncarceratedActiveCases =
        mostRecentIncarceratedCases -
        mostRecentIncarceratedRecoveredCases -
        mostRecentIncarceratedDeaths;
      console.log(incarceratedActiveCases, mostRecentIncarceratedActiveCases);
      delta = mostRecentIncarceratedActiveCases - incarceratedActiveCases;
      deltaDirection = delta > 0 ? "positive" : delta < 0 ? "negative" : "same";
    }
  }
  const facilitySummaryData: FacilitySummaryData = {
    incarceratedPopulation: incarceratedPopulation,
    incarceratedPopulationDelta: 0,
    incarceratedPopulationDeltaDirection: "same",
    incarceratedCases: incarceratedActiveCases,
    incarceratedCasesDelta: delta,
    incarceratedCasesDeltaDirection: deltaDirection,
  };
  return facilitySummaryData;
}

const FacilitySummaryTable: React.FC<{
  facility: Facility;
}> = ({ facility }) => {
  const facilitySummaryData = buildFacilitySummaryData(facility);

  return <>{makeSummaryColumns(facilitySummaryData)}</>;
};

export default FacilitySummaryTable;
