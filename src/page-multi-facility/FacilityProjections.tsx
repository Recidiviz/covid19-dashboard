import React, { useContext } from "react";

import ChartArea from "../impact-dashboard/ChartArea";
import { useEpidemicModelState } from "../impact-dashboard/EpidemicModelContext";
import ImpactProjectionTableContainer from "../impact-dashboard/ImpactProjectionTableContainer";
import { FacilityContext } from "./FacilityContext";
import { useProjectionData } from "./projectionCurveHooks";

const FacilityProjections: React.FC = () => {
  const { facility, rtData } = useContext(FacilityContext);
  let useRt, facilityRtData;
  // when creating a new facility, we won't have Rt yet,
  // so fall back to using the rate of spread from user input
  if (facility) {
    useRt = true;
    facilityRtData = rtData ? rtData[facility.id] : undefined;
  }
  const projectionData = useProjectionData(
    useEpidemicModelState(),
    useRt,
    facilityRtData,
  );
  return (
    <>
      <ChartArea projectionData={projectionData} />
      <ImpactProjectionTableContainer projectionData={projectionData} />
    </>
  );
};

export default FacilityProjections;
