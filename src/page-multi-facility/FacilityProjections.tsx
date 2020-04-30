import React from "react";

import ChartArea from "../impact-dashboard/ChartArea";
import { useEpidemicModelState } from "../impact-dashboard/EpidemicModelContext";
import ImpactProjectionTableContainer from "../impact-dashboard/ImpactProjectionTableContainer";
import { useProjectionFromUserInput } from "./projectionCurveHooks";

const FacilityProjections = () => {
  const projectionData = useProjectionFromUserInput(useEpidemicModelState());
  return (
    <>
      <ChartArea projectionData={projectionData} />
      <ImpactProjectionTableContainer projectionData={projectionData} />
    </>
  );
};

export default FacilityProjections;
