import { get, omit, pick, sum, values } from "lodash";
import React from "react";
import styled from "styled-components";

import Colors, { MarkColors as markColors } from "../design-system/Colors";
import Loading from "../design-system/Loading";
import { Column, PageContainer } from "../design-system/PageColumn";
import {
  findMatchingDay,
  findMostRecentDate,
} from "../hooks/useAddCasesInputs";
import ChartArea from "../impact-dashboard/ChartArea";
import { useEpidemicModelState } from "../impact-dashboard/EpidemicModelContext";
import {
  caseBracketKeys,
  deathBracketKeys,
  incarceratedPopulationKeys,
  recoveredBracketKeys,
} from "../impact-dashboard/EpidemicModelContext";
import {
  formatThousands,
  TableRow,
} from "../impact-dashboard/ImpactProjectionTable";
import {
  buildIncarceratedData,
  buildStaffData,
} from "../impact-dashboard/ImpactProjectionTableContainer";
import { CurveData } from "../infection-model";
import { RtData, RtError } from "../infection-model/rt";
import { initialPublicCurveToggles } from "../page-multi-facility/curveToggles";
import { useProjectionData } from "../page-multi-facility/projectionCurveHooks";
import { Facility, ModelInputs } from "../page-multi-facility/types";
import SnapshotPage from "./SnapshotPage";

const VALUE_MAPPING = {
  cases: caseBracketKeys,
  deaths: deathBracketKeys,
  population: incarceratedPopulationKeys,
  recovered: recoveredBracketKeys,
};

const DURATION = 21;

const DELTA_DIRECTION_MAPPING = {
  positive: "↑ ",
  negative: "↓ ",
  same: "↑ ",
};

const Heading = styled.div`
  font-weight: 700;
  line-height: 13px;
  border-top: 1px solid ${Colors.darkGray};
  padding: 5px 0;
`;

export const Table = styled.table`
  color: ${Colors.black};
  text-align: left;
  width: 100%;
  margin-top: 10px;
`;

const TableHeadingCell = styled.td`
  font-family: "Poppins", sans serif;
  line-height: 24px;
  margin-right: 5px;
  vertical-align: middle;
`;

const BorderDiv = styled.div<{ marginRight?: string }>`
  border-top: 2px solid ${Colors.darkGray};
  margin-right: ${(props) => props.marginRight || "5px"};
  margin-bottom: 5px;
`;

const ProjectionSection = styled.div`
  margin-top: 10px;
  padding: 5px 0;
`;

const ProjectionContainer = styled.div`
  .axis-title text,
  .axis-label {
    fill: ${Colors.black};
    font-family: "Libre Franklin";
  }
`;

const HorizontalRule = styled.hr`
  border-color: ${Colors.opacityGray};
  margin: 10px 0;
`;

const TableCell = styled.td<{ label?: boolean }>`
  font-size: 13px;
  line-height: 200%;
  text-align: "left"};
  opacity: 0.7;
  border-top: 1px solid  ${Colors.darkGray};
  vertical-align: middle;
  width: ${(props) => (props.label ? "200px" : "auto")};
`;

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

function makeTableRow(row: TableRow) {
  const { label, week1, week2, week3, overall } = row;
  return (
    <tr key={label}>
      <TableCell label>{label}</TableCell>
      <TableCell>{formatThousands(week1)}</TableCell>
      <TableCell>{formatThousands(week2)}</TableCell>
      <TableCell>{formatThousands(week3)}</TableCell>
      <TableCell>{formatThousands(overall)}</TableCell>
    </tr>
  );
}

function makeHeadingRow() {
  return (
    <tr>
      <td />
      <TableHeadingCell>
        <BorderDiv>Week 1</BorderDiv>
      </TableHeadingCell>
      <TableHeadingCell>
        <BorderDiv>Week 2</BorderDiv>
      </TableHeadingCell>
      <TableHeadingCell>
        <BorderDiv>Week 3</BorderDiv>
      </TableHeadingCell>
      <TableHeadingCell>
        <BorderDiv>Overall</BorderDiv>
      </TableHeadingCell>
    </tr>
  );
}

interface ProjectionProps {
  projectionData: CurveData | undefined;
}

interface FacilitySummaryData {
  incarceratedCases: number;
  incarceratedCasesDelta: number;
  incarceratedCasesDeltaDirection: string;
}

const FacilityProjection: React.FC<ProjectionProps> = ({ projectionData }) => {
  return (
    <ChartArea
      projectionData={projectionData}
      initialCurveToggles={initialPublicCurveToggles}
      markColors={markColors}
      title={"Estimated Impact"}
    />
  );
};

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

// function getMostRecentTotalIncarceratedValues(facility: Facility, value: string) {

// }

function getTotalIncarceratedValues(modelInputs: ModelInputs, value: string) {
  let result = 0;
  const valueKeys = get(VALUE_MAPPING, value);
  const data = omit(
    pick(modelInputs, valueKeys),
    "staffDeaths",
    "staffRecovered",
    "staffCases",
  );
  // if (keys(data).length > 0) {
  //   hasData = true;
  // }
  result += sum(values(data));
  return result;
}

interface Props {
  facility: Facility;
  rtData: RtData | RtError | undefined;
}

const FacilityPage: React.FC<Props> = ({ facility, rtData }) => {
  const projectionData = useProjectionData(
    useEpidemicModelState(),
    true,
    rtData,
    DURATION,
  );
  if (!projectionData) return <Loading />;
  const { incarcerated, staff } = projectionData;
  const incarceratedData = buildIncarceratedData(incarcerated);
  const staffData = buildStaffData({ staff, showHospitalizedRow: false });
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
      console.log(facility.modelInputs);
      console.log(mostRecentData);
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
    incarceratedCases: incarceratedActiveCases,
    incarceratedCasesDelta: delta,
    incarceratedCasesDeltaDirection: deltaDirection,
  };

  return (
    <SnapshotPage header={facility.name}>
      Facility Summary
      <ProjectionSection>
        <ProjectionContainer>
          <HorizontalRule />
          <PageContainer>
            {makeSummaryColumns(facilitySummaryData)}
          </PageContainer>
          <HorizontalRule />
        </ProjectionContainer>
      </ProjectionSection>
      Facility-Specific Projection
      <ProjectionSection>
        <ProjectionContainer>
          <FacilityProjection projectionData={projectionData} />
        </ProjectionContainer>

        <Heading>Incarcerated Population Projection</Heading>
        <Table>
          <tbody>
            {makeHeadingRow()}
            {incarceratedData.map((row) => makeTableRow(row))}
          </tbody>
        </Table>
      </ProjectionSection>
      <ProjectionSection>
        <Heading>Staff Projection</Heading>
        <Table>
          <tbody>
            {makeHeadingRow()}
            {staffData.map((row) => makeTableRow(row))}
          </tbody>
        </Table>
      </ProjectionSection>
    </SnapshotPage>
  );
};

export default FacilityPage;
