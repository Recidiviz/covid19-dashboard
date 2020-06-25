import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { getFacilities } from "../database";
import Colors, { MarkColors as markColors } from "../design-system/Colors";
import iconSrcRecidiviz from "../design-system/icons/ic_recidiviz.svg";
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

const ScenarioDataViz = styled.div`
  color: ${Colors.opacityGray};
  display: flex;
  height: 45%;
  background-color: ${Colors.gray};
`;

const IconRecidviz = styled.img`
  width: 50px;
  height: 50px;
  margin: auto;
`;

const LoadingWrapper = styled.div`
  color: ${Colors.opacityGray};
  display: flex;
  height: 45%;
  align-content: center;
`;

interface FacilityChartProps {
  hasFacility: boolean;
  facility: Facility | undefined;
  facilityRtData: RtValue | undefined;
}

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
      {props.hasFacility ? (
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
      ) : (
        <ScenarioDataViz>
          <IconRecidviz alt="Recidiviz" src={iconSrcRecidiviz} />
        </ScenarioDataViz>
      )}
    </>
  );
};

const FacilityChart: React.FC<{
  scenarioId: string;
}> = ({ scenarioId }) => {
  const [loading, setLoading] = useState(true);
  const [hasFacility, setHasFacility] = useState(false);
  const [facility, setFacility] = useState<Facility | undefined>();
  const [facilityRtData, setFacilityRtData] = useState<RtValue | undefined>();
  const { data: localeDataSource } = useLocaleDataState();

  useEffect(() => {
    let mounted = true;
    async function fetchFacility() {
      const facilities = await getFacilities(scenarioId);
      if (facilities && facilities.length > 0) {
        const firstFacility = facilities[0];
        const firstFacilityRtData = await getRtDataForFacility(firstFacility);
        if (mounted) {
          setHasFacility(true);
          setFacility(firstFacility);
          setFacilityRtData(firstFacilityRtData);
          setLoading(false);
        }
      } else {
        if (mounted) {
          setHasFacility(false);
          setLoading(false);
        }
      }
    }
    fetchFacility();
    return () => {
      mounted = false;
    };
  }, [scenarioId]);

  return (
    <>
      {!loading ? (
        <EpidemicModelProvider
          facilityModel={facility?.modelInputs}
          localeDataSource={localeDataSource}
        >
          <FacilityChartWrapper
            facility={facility}
            facilityRtData={facilityRtData}
            hasFacility={hasFacility}
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
