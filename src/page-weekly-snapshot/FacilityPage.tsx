import React from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import Loading from "../design-system/Loading";
import { useEpidemicModelState } from "../impact-dashboard/EpidemicModelContext";
import {
  formatThousands,
  TableRow,
} from "../impact-dashboard/ImpactProjectionTable";
import {
  buildIncarceratedData,
  buildStaffData,
} from "../impact-dashboard/ImpactProjectionTableContainer";
import { RtData, RtError } from "../infection-model/rt";
import { useProjectionData } from "../page-multi-facility/projectionCurveHooks";
import { Facility } from "../page-multi-facility/types";
import FacilityProjectionChart from "./FacilityProjectionChart";
import FacilitySummaryTable from "./FacilitySummaryTable";
import {
  BorderDiv,
  CellHeaderContainer,
  COLUMN_SPACING,
  Header,
  HorizontalRule,
  LeftHeading,
  SectionHeader,
  Table,
  TableCell,
  TableCellContainer,
  TableHeading,
  TextContainer,
  Value,
} from "./shared";
import SnapshotPage from "./SnapshotPage";

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

interface Props {
  facility: Facility;
  rtData: RtData | RtError | undefined;
}

function makeTableRow(row: TableRow) {
  const { label, week1, week2, week3, overall } = row;
  return (
    <tr key={label}>
      <TableCell>{label}</TableCell>
      {[week1, week2, week3, overall].map((data, idx) => (
        <TableCell key={`FacilityTable-${label}-${idx}`}>
          <TableCellContainer marginRight={COLUMN_SPACING}>
            <HorizontalRule />
            <TextContainer>
              <Value>{formatThousands(data)}</Value>
            </TextContainer>
          </TableCellContainer>
        </TableCell>
      ))}
    </tr>
  );
}

function makeHeadingRow() {
  return (
    <tr>
      <td />
      <TableCell>
        <CellHeaderContainer>
          <Header>Week 1</Header>
        </CellHeaderContainer>
      </TableCell>
      <TableCell>
        <CellHeaderContainer>
          <Header>Week 2</Header>
        </CellHeaderContainer>
      </TableCell>
      <TableCell>
        <CellHeaderContainer>
          <Header>Week 3</Header>
        </CellHeaderContainer>
      </TableCell>
      <TableCell>
        <CellHeaderContainer>
          <Header>Overall</Header>
        </CellHeaderContainer>
      </TableCell>
    </tr>
  );
}

const FacilityPage: React.FC<Props> = ({ facility, rtData }) => {
  const curveData = useProjectionData(useEpidemicModelState(), true, rtData);
  if (!curveData) return <Loading />;
  const { incarcerated, staff } = curveData;
  const incarceratedData = buildIncarceratedData(incarcerated);
  const staffData = buildStaffData({ staff, showHospitalizedRow: false });

  return (
    <SnapshotPage header={facility.name}>
      <LeftHeading>Facility-Specific Projection</LeftHeading>
      <ProjectionSection>
        <ProjectionContainer>
          <FacilitySummaryTable facility={facility} />
        </ProjectionContainer>
      </ProjectionSection>

      <ProjectionSection>
        <ProjectionContainer>
          <FacilityProjectionChart curveData={curveData} />
        </ProjectionContainer>

        <HorizontalRule marginRight={COLUMN_SPACING} />
        <Table>
          <thead>
            <tr>
              <TableHeading colSpan={5}>
                <TableCellContainer marginRight={COLUMN_SPACING}>
                  <TextContainer>
                    <SectionHeader>
                      Incarcerated Population Projection
                    </SectionHeader>
                  </TextContainer>
                  <BorderDiv />
                </TableCellContainer>
              </TableHeading>
            </tr>
          </thead>
          <tbody>
            {makeHeadingRow()}
            {incarceratedData.map((row) => makeTableRow(row))}
          </tbody>
        </Table>
      </ProjectionSection>
      <ProjectionSection>
        <HorizontalRule marginRight={COLUMN_SPACING} />
        <Table>
          <thead>
            <tr>
              <TableHeading colSpan={5}>
                <TableCellContainer marginRight={COLUMN_SPACING}>
                  <TextContainer>
                    <SectionHeader>Staff Projection</SectionHeader>
                  </TextContainer>
                  <BorderDiv />
                </TableCellContainer>
              </TableHeading>
            </tr>
          </thead>
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
