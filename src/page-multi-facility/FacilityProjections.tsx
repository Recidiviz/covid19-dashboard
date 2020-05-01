import React, { useContext } from "react";

import { useFlag } from "../feature-flags";
import ChartArea from "../impact-dashboard/ChartArea";
import { useEpidemicModelState } from "../impact-dashboard/EpidemicModelContext";
import ImpactProjectionTableContainer from "../impact-dashboard/ImpactProjectionTableContainer";
import { FacilityContext } from "./FacilityContext";
import { useProjectionData } from "./projectionCurveHooks";

const FacilityProjections: React.FC = () => {
  const { facility, rtData } = useContext(FacilityContext);
  let useRt, facilityRtData;
  if (useFlag(["useRt"])) {
    useRt = true;
    facilityRtData = rtData && facility ? rtData[facility.id] : undefined;
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
