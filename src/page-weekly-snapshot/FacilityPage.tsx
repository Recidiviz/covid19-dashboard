import React from "react";
import styled from "styled-components";

import Colors, { MarkColors as markColors } from "../design-system/Colors";
import Loading from "../design-system/Loading";
import ChartArea from "../impact-dashboard/ChartArea";
import { useEpidemicModelState } from "../impact-dashboard/EpidemicModelContext";
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
import { Facility } from "../page-multi-facility/types";
import FacilitySummaryTable from "./FacilitySummaryTable";
import SnapshotPage from "./SnapshotPage";

const DURATION = 21;

const Heading = styled.div`
  font-weight: 700;
  line-height: 13px;
  border-top: 1px solid ${Colors.darkGray};
  padding: 10px 0;
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

export const BorderDiv = styled.div<{ marginRight?: string }>`
  border-top: 1px solid ${Colors.black};
  margin-right: ${(props) => props.marginRight || "5px"};
  margin-bottom: 10px;
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

export const HorizontalRule = styled.hr<{ marginRight?: string }>`
  border-color: ${Colors.opacityGray};
  margin-top: 10px;
  margin-right: ${(props) => props.marginRight || "0px"};
`;

const TableCell = styled.td<{ labelCell?: boolean }>`
  font-size: 13px;
  line-height: 200%;
  text-align: left;
  opacity: 0.7;
  border-top: 1px solid ${Colors.darkGray};
  vertical-align: middle;
  width: ${(props) => (props.labelCell ? "200px" : "auto")};
`;

interface Props {
  facility: Facility;
  rtData: RtData | RtError | undefined;
}

interface ProjectionProps {
  projectionData: CurveData | undefined;
}

function makeTableRow(row: TableRow) {
  const { label, week1, week2, week3, overall } = row;
  return (
    <tr key={label}>
      <TableCell labelCell>{label}</TableCell>
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
      <TableHeadingCell>Week 1</TableHeadingCell>
      <TableHeadingCell>Week 2</TableHeadingCell>
      <TableHeadingCell>Week 3</TableHeadingCell>
      <TableHeadingCell>Overall</TableHeadingCell>
    </tr>
  );
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

  return (
    <SnapshotPage header={facility.name}>
      <ProjectionSection>
        <ProjectionContainer>
          <Heading>Facility Summary</Heading>
          <FacilitySummaryTable facility={facility} />
          <HorizontalRule />
        </ProjectionContainer>
      </ProjectionSection>
      Facility-Specific Projection
      <ProjectionSection>
        <ProjectionContainer>
          <FacilityProjection projectionData={projectionData} />
        </ProjectionContainer>

        <Heading>Incarcerated Population Projection</Heading>
        <BorderDiv />
        <Table>
          <tbody>
            {makeHeadingRow()}
            {incarceratedData.map((row) => makeTableRow(row))}
          </tbody>
        </Table>
      </ProjectionSection>
      <ProjectionSection>
        <Heading>Staff Projection</Heading>
        <BorderDiv />
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
