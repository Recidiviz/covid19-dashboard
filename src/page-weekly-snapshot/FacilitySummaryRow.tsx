import React from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import { makeTableRow, formatPct } from "../impact-dashboard/ImpactProjectionTable";
import { buildIncarceratedData, buildStaffData } from "../impact-dashboard/ImpactProjectionTableContainer";
import { useEpidemicModelState } from "../impact-dashboard/EpidemicModelContext";
import { useProjectionData } from "../page-multi-facility/projectionCurveHooks";
import { Facility } from "../page-multi-facility/types";
import { RtData, RtError } from "../infection-model/rt";
import Loading from "../design-system/Loading";


const FacilitySummaryRowContainer = styled.div`
  font-size: 11px;
  font-weight: 400;
  font-family: "Libre Franklin";
`;

const Heading = styled.div`
  font-weight: bold;
  line-height: 13px;
`;

const FacilityName = styled.div`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 3px;
`;

export const Table = styled.table`
  color: ${Colors.black};
  text-align: left;
  width: 100%;
  margin-top: 10px;
`;

const TableHeadingCell = styled.td`
  font-family: "Poppins", sans serif;
  line-height: 16px;
`;

const ProjectionSection = styled.div`
  border: 1px solid ${Colors.black};
  margin-top: 10px;
  padding: 5px;
`;

interface Props {
  facility: Facility;
  rtData: RtData | RtError | undefined;
}

const FacilitySummaryRow: React.FC<Props> = ({ facility, rtData }) => {
  const projectionData = useProjectionData(useEpidemicModelState(), true, rtData)
  if (!projectionData) return <Loading />;
  const { incarcerated, staff } = projectionData;

  const incarceratedData = buildIncarceratedData(incarcerated)
  const staffData = buildStaffData({ staff, showHospitalizedRow: false})
  return (
    <FacilitySummaryRowContainer>
      <FacilityName>{facility.name}</FacilityName>
      Facility-Specific Projection
      <ProjectionSection>
        <Heading>Incarcerated Population Projection</Heading>
        <Table>
          <tbody>
            <tr>
              <TableHeadingCell />
              <TableHeadingCell>Week 1</TableHeadingCell>
              <TableHeadingCell>Week 2</TableHeadingCell>
              <TableHeadingCell>Week 3</TableHeadingCell>
              <TableHeadingCell>Overall</TableHeadingCell>
            </tr>
            {incarceratedData.map((row, i) => {
              const formatter = i === 2 ? formatPct : undefined;
              return makeTableRow({ row, formatter, snapshot: true });
            })}
          </tbody>
        </Table>
      </ProjectionSection>
      <ProjectionSection>
        <Heading>Staff Projection</Heading>
        <Table>
          <tbody>
            <tr>
              <TableHeadingCell />
              <TableHeadingCell>Week 1</TableHeadingCell>
              <TableHeadingCell>Week 2</TableHeadingCell>
              <TableHeadingCell>Week 3</TableHeadingCell>
              <TableHeadingCell>Overall</TableHeadingCell>
            </tr>
            {staffData.map((row) => makeTableRow({
              row, formatter: undefined, snapshot: true })
            )}
          </tbody>
        </Table>
      </ProjectionSection>
    </FacilitySummaryRowContainer>
  );
};

export default FacilitySummaryRow;
