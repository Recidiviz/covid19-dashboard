import React from "react";

import { MarkColors } from "../design-system/Colors";
import { useFacilities } from "../facilities-context";
import ChartArea from "../impact-dashboard/ChartArea";
import { useEpidemicModelState } from "../impact-dashboard/EpidemicModelContext";
import ImpactProjectionTableContainer from "../impact-dashboard/ImpactProjectionTableContainer";
import { initialPublicCurveToggles } from "../page-multi-facility/curveToggles";
import { useProjectionData } from "./projectionCurveHooks";
import { Facility } from "./types";

interface Props {
  facility: Facility | undefined;
}

const FacilityProjections: React.FC<Props> = ({ facility }) => {
  const {
    state: { rtData },
  } = useFacilities();
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
      <ChartArea
        projectionData={projectionData}
        initialCurveToggles={initialPublicCurveToggles}
        markColors={MarkColors}
      />
      <ImpactProjectionTableContainer projectionData={projectionData} />
    </>
  );
};

export default FacilityProjections;
