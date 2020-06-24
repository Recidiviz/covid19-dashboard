import React, { useEffect, useState } from "react";
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

interface FacilityChartProps {
  facility: Facility | undefined;
  facilityRtData: RtValue | undefined;
}

const FacilityChart: React.FC<{
  scenarioId: string;
  indexOfFacility: number;
}> = ({ scenarioId, indexOfFacility }) => {
  const [facility, setFacility] = useState<Facility | undefined>();
  const [facilityRtData, setFacilityRtData] = useState<RtValue | undefined>();
  const { data: localeDataSource } = useLocaleDataState();

  useEffect(() => {
    let mounted = true;
    async function fetchFacility() {
      const facilities = await getFacilities(scenarioId);
      if (facilities) {
        const facility = facilities[indexOfFacility];
        const facilityRtData = await getRtDataForFacility(facility);
        if (mounted) {
          setFacility(facility);
          setFacilityRtData(facilityRtData);
        }
      }
    }
    fetchFacility();
    return () => {
      mounted = false;
    };
  }, []);

  const FacilityChartWrapper = (props: FacilityChartProps) => {
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
      {facility && facilityRtData ? (
        <EpidemicModelProvider
          facilityModel={facility?.modelInputs}
          localeDataSource={localeDataSource}
        >
          <FacilityChartWrapper
            facility={facility}
            facilityRtData={facilityRtData}
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
