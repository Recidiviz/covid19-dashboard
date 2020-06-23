import React from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import ImpactProjectionTable from "../impact-dashboard/ImpactProjectionTable";
import { buildIncarceratedData, buildStaffData } from "../impact-dashboard/ImpactProjectionTableContainer";
import { useEpidemicModelState } from "../impact-dashboard/EpidemicModelContext";
import { useProjectionData } from "../page-multi-facility/projectionCurveHooks";
import { Facility } from "../page-multi-facility/types";
import { RtData, RtError } from "../infection-model/rt";
import Loading from "../design-system/Loading";


const FacilitySummaryRowContainer = styled.div`
  font-size: 12px;
  font-weight: 400;
`;


const FacilityName = styled.div`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 3px;
`;

const ProjectionSection = styled.div`
  border: 1px solid ${Colors.black};
  padding: 5px;
  margin-top: 10px;
`;

interface Props {
  facility: Facility;
  rtData: RtData | RtError | undefined;
}

const FacilitySummaryRow: React.FC<Props> = ({ facility, rtData }) => {
  const projectionData = useProjectionData(useEpidemicModelState(), true, rtData)
  console.log({projectionData})
  console.log({rtData})
  if (!projectionData) return <Loading />;
  const { incarcerated, staff } = projectionData;

  const incarceratedData = buildIncarceratedData(incarcerated)
  const staffData = buildStaffData(staff, false)
  return (
    <FacilitySummaryRowContainer>
      <FacilityName>{facility.name}</FacilityName>
      Facility-Specific Projection
      <ImpactProjectionTable {...{ incarceratedData, staffData }} snapshotVersion />
    </FacilitySummaryRowContainer>
  );
};

export default FacilitySummaryRow;
