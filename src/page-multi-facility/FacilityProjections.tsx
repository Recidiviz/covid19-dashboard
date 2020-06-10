import React from "react";

import { MarkColors } from "../design-system/Colors";
import { useFacilities } from "../facilities-context";
import ChartArea from "../impact-dashboard/ChartArea";
import { useEpidemicModelState } from "../impact-dashboard/EpidemicModelContext";
import ImpactProjectionTableContainer from "../impact-dashboard/ImpactProjectionTableContainer";
import { initialPublicCurveToggles } from "../page-multi-facility/curveToggles";
import {
  useChartDataFromProjectionData,
  useProjectionData,
} from "./projectionCurveHooks";
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

  const { hospitalBeds } = useEpidemicModelState();

  const projectionData = useProjectionData(
    useEpidemicModelState(),
    useRt,
    facilityRtData,
  );

  const chartData = useChartDataFromProjectionData(projectionData);

  return (
    <>
      <ChartArea
        initialCurveToggles={initialPublicCurveToggles}
        markColors={MarkColors}
        addAnnotations={true}
        hospitalBeds={hospitalBeds}
        chartData={chartData}
      />
      <ImpactProjectionTableContainer projectionData={projectionData} />
    </>
  );
};

export default FacilityProjections;
