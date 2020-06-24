import React, { useCallback, useEffect, useState } from "react";

import { getFacilities } from "../database";
import Colors, { MarkColors as markColors } from "../design-system/Colors";
import Loading from "../design-system/Loading";
import useRejectionToast from "../hooks/useRejectionToast";
import CurveChartContainer from "../impact-dashboard/CurveChartContainer";
import { EpidemicModelProvider } from "../impact-dashboard/EpidemicModelContext";
import useModel from "../impact-dashboard/useModel";
import {
  getNewestRt,
  getRtDataForFacility,
  isRtData,
} from "../infection-model/rt";
import { useLocaleDataState } from "../locale-data-context";
import { initialPublicCurveToggles } from "./curveToggles";
import FacilityRow from "./FacilityRow";
import FacilityRowPlaceholder from "./FacilityRowPlaceholder";
import FacilityRowRtValuePill from "./FacilityRowRtValuePill";
import {
  useChartDataFromProjectionData,
  useProjectionData,
} from "./projectionCurveHooks";
import { Facility, RtValue, Scenario } from "./types";

const FacilityChart: React.FC<{
  scenarioId: string;
}> = ({ scenarioId }) => {
  const [firstFacility, setFirstFacility] = useState<Facility | null>();
  const [
    firstFacilityRtData,
    setFirstFacilityRtData,
  ] = useState<RtValue | null>();
  const { data: localeDataSource } = useLocaleDataState();

  const handleFacilitySave = (facility: Facility) => {
    console.log(facility);
  };

  const fetchFacility = useCallback(async () => {
    const facilities = await getFacilities(scenarioId);
    const firstFacility = facilities?.[0];
    if (firstFacility) {
      const firstFacilityRtData = await getRtDataForFacility(firstFacility);
      setFirstFacility(firstFacility);
      setFirstFacilityRtData(firstFacilityRtData);
    }
  }, []);

  //   useEffect(() => {
  //       let isMounted = true;
  //     if (isMounted) {
  //         fetchFacility();
  //     }
  //     return () => isMounted = false
  //   }, [fetchFacility]);

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      fetchFacility();
    }
    isMounted = false;
  }, []);

  const FacilityChartWrapper = (props: any) => {
    const [model] = useModel();
    const chartData = useChartDataFromProjectionData(
      useProjectionData(model, true, props.facilityRtData),
    );

    return (
      <>
        <div>
          <CurveChartContainer
            curveData={chartData}
            chartHeight={144}
            hideAxes={true}
            groupStatus={initialPublicCurveToggles}
            markColors={markColors}
            addAnnotations={false}
          />
        </div>
      </>
    );
  };

  return (
    <>
      {firstFacility && firstFacilityRtData ? (
        <EpidemicModelProvider
          facilityModel={firstFacility?.modelInputs}
          localeDataSource={localeDataSource}
        >
          <FacilityChartWrapper
            facility={firstFacility}
            facilityRtData={firstFacilityRtData}
          />
        </EpidemicModelProvider>
      ) : (
        <Loading styles={{ minHeight: 100, paddingBottom: 100 }} />
      )}
    </>
  );
};

export default FacilityChart;
