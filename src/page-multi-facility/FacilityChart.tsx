import React, { useCallback, useEffect, useState } from "react";

import { getFacilities } from "../database";
import Colors, { MarkColors as markColors } from "../design-system/Colors";
import Loading from "../design-system/Loading";
import useRejectionToast from "../hooks/useRejectionToast";
import CurveChartContainer from "../impact-dashboard/CurveChartContainer";
import { EpidemicModelProvider } from "../impact-dashboard/EpidemicModelContext";
import useModel from "../impact-dashboard/useModel";
import { getRtDataForFacility } from "../infection-model/rt";
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

  useEffect(() => {
    fetchFacility();
  }, [fetchFacility]);

  const FacilityChartWrapper = (props: any) => {
    const [model] = useModel();
    const chartData = useChartDataFromProjectionData(
      useProjectionData(model, true, props.facilityRtData),
    );

    return (
      <>
        <div>
          {/* {props.facilityRtData !== undefined && (
        <FacilityRowRtValuePill latestRt={latestRt} />
        )} */}
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
        <FacilityRowPlaceholder key={firstFacility?.id}>
          <EpidemicModelProvider
            facilityModel={firstFacility?.modelInputs}
            localeDataSource={localeDataSource}
          >
            <FacilityChartWrapper
              facility={firstFacility}
              facilityRtData={firstFacilityRtData}
            />

            {/* <FacilityRow
              facility={firstFacility}
              facilityRtData={firstFacilityRtData}
              onSave={handleFacilitySave}
            /> */}
          </EpidemicModelProvider>
        </FacilityRowPlaceholder>
      ) : (
        <Loading />
      )}
      ;
    </>
  );
};

export default FacilityChart;
