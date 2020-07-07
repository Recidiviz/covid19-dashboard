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
import Page from "./Page";

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

const BorderDiv = styled.div`
  border-top: 2px solid ${Colors.darkGray};
  margin-right: 5px;
`;

const ProjectionSection = styled.div`
  margin-top: 10px;
  padding: 5px 0;
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

interface Props {
  facility: Facility;
  rtData: RtData | RtError | undefined;
}

const FacilityPage: React.FC<Props> = ({ facility, rtData }) => {
  const projectionData = useProjectionData(
    useEpidemicModelState(),
    true,
    rtData,
  );
  if (!projectionData) return <Loading />;
  const { incarcerated, staff } = projectionData;

  const incarceratedData = buildIncarceratedData(incarcerated);
  const staffData = buildStaffData({ staff, showHospitalizedRow: false });
  return (
    <Page header={facility.name}>
      Facility-Specific Projection
      <ProjectionSection>
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
    </Page>
  );
};

export default FacilityPage;
