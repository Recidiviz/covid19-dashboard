import React from "react";
import styled from "styled-components";

import Colors, { MarkColors } from "../design-system/Colors";
import CurveChart from "../impact-dashboard/CurveChart";
import { LocaleData } from "../locale-data-context";
import { Facilities } from "../page-multi-facility/types";
import {
  useCurrentCurveData,
  useEpidemicModelState,
  useSystemWideData,
} from "../page-response-impact/hooks";
import { getCurveChartData } from "../page-response-impact/responseChartData";

const SystemWideProjectionChartContainer = styled.div`
  font-size: 12px;
  font-weight: 400;
`;

const CurveChartContainer = styled.div`
  margin-bottom: 50px;
`;

export const ChartHeader = styled.h3`
  border-top: 1px solid ${Colors.opacityGray};
  border-bottom: 1px solid ${Colors.opacityGray};
  color: ${Colors.black};
  font-family: "Libre Franklin";
  font-style: normal;
  font-weight: 700;
  font-size: 11px;
  line-height: 13px;
`;

interface Props {
  localeData: LocaleData;
  facilities: Facilities;
}

const SystemWideProjectionChart: React.FC<Props> = ({
  localeData,
  facilities,
}) => {
  const epidemicModelState = useEpidemicModelState(facilities, localeData);
  // const systemWideData = useSystemWideData(
  //   scenario.data.baselinePopulations,
  //   facilities,
  //   epidemicModelState,
  //   localeData,
  // );
  const currentCurveInputs = useCurrentCurveData(
    epidemicModelState,
    localeData,
  );
  // const currentCurveData = getCurveChartData(currentCurveInputs);

  // <CurveChart
  //   chartHeight={250}
  //   hideAxes={false}
  //   yAxisExtent={[0, 100]}
  //   hospitalBeds={50}
  //   markColors={MarkColors}
  //   curveData={currentCurveData}
  // />

  return (
    <SystemWideProjectionChartContainer>
      <CurveChartContainer>
        <ChartHeader>
          System-Wide Projection for Facilities with Active Cases
        </ChartHeader>
      </CurveChartContainer>
    </SystemWideProjectionChartContainer>
  );
};

export default SystemWideProjectionChart;
