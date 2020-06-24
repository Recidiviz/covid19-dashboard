import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";

import { getFacilities } from "../database";
import Colors, { MarkColors as markColors } from "../design-system/Colors";
import Loading from "../design-system/Loading";
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
import FacilityRowRtValuePill from "./FacilityRowRtValuePill";
import {
  useChartDataFromProjectionData,
  useProjectionData,
} from "./projectionCurveHooks";
import { Facility, RtValue } from "./types";

const LoadingWrapper = styled.div`
  color: ${Colors.opacityGray};
  display: flex;
  height: 45%;
  align-content: center;
`;

const FacilityChart: React.FC<{
  scenarioId: string;
}> = ({ scenarioId }) => {
  const [firstFacility, setFirstFacility] = useState<Facility | null>();
  const [firstFacilityRtData, setFirstFacilityRtData] = useState<
    RtValue | undefined
  >();
  const { data: localeDataSource } = useLocaleDataState();

  //   const fetchFacility = useCallback(async () => {
  //     const facilities = await getFacilities(scenarioId);
  //     let firstFacility = null;
  //     let firstFacilityRtData = null;
  //     if (facilities) {
  //         firstFacility = facilities.[0];
  //         firstFacilityRtData = await getRtDataForFacility(firstFacility);
  //     }
  //     if (firstFacility) {
  //     //   setFirstFacility(firstFacility);
  //     //   setFirstFacilityRtData(firstFacilityRtData);
  //     }
  //   }, []);

  useEffect(() => {
    let mounted = true;
    async function fetchFacility() {
      const facilities = await getFacilities(scenarioId);
      let firstFacility = null;
      let firstFacilityRtData = null;
      if (facilities) {
        firstFacility = facilities?.[0];
        firstFacilityRtData = await getRtDataForFacility(firstFacility);
      }
      if (mounted) {
        setFirstFacility(firstFacility);
        if (firstFacilityRtData) {
          setFirstFacilityRtData(firstFacilityRtData);
        }
      }
    }
    fetchFacility();
    return () => {
      mounted = false;
    };
  }, []);

  const FacilityChartWrapper = (props: any) => {
    const [model] = useModel();
    const latestRt = isRtData(props.facilityRtData)
      ? getNewestRt(props.facilityRtData.Rt)?.value
      : props.facilityRtData;
    const chartData = useChartDataFromProjectionData(
      useProjectionData(model, true, props.facilityRtData),
    );

    return (
      <>
        <div className="relative">
          {props.facilityRtData !== undefined && (
            <FacilityRowRtValuePill latestRt={latestRt} />
          )}
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
        <LoadingWrapper>
          <Loading />
        </LoadingWrapper>
      )}
    </>
  );
};

export default FacilityChart;
