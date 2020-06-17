import { flattenDeep } from "lodash";
import React from "react";
import styled from "styled-components";

import Colors, { MarkColors } from "../design-system/Colors";
import CurveChart from "../impact-dashboard/CurveChart";
import {
  getCurveChartData,
  SystemWideData,
} from "../impact-dashboard/responseChartData";
import { CurveFunctionInputs } from "../infection-model";
import ProjectionsLegend from "../page-multi-facility/ProjectionsLegend";
import { ChartHeader } from "./styles";

const CurveChartContainer = styled.div`
  margin-bottom: 50px;
`;

interface Props {
  systemWideData: SystemWideData;
  originalCurveInputs: CurveFunctionInputs[];
  currentCurveInputs: CurveFunctionInputs[];
}

const ProjectionCharts: React.FC<Props> = ({
  systemWideData,
  originalCurveInputs,
  currentCurveInputs,
}) => {
  const originalCurveData = getCurveChartData(originalCurveInputs);
  const currentCurveData = getCurveChartData(currentCurveInputs);
  const maxValue = Math.ceil(
    Math.max(
      ...flattenDeep([
        Object.values(currentCurveData),
        Object.values(originalCurveData),
      ]),
    ),
  );
  return (
    <>
      <CurveChartContainer>
        <ChartHeader>
          Original Projection
          <ProjectionsLegend />
        </ChartHeader>
        <CurveChart
          chartHeight={250}
          hideAxes={false}
          yAxisExtent={[0, maxValue]}
          hospitalBeds={systemWideData.hospitalBeds}
          markColors={MarkColors}
          curveData={originalCurveData}
        />
      </CurveChartContainer>
      <CurveChartContainer>
        <ChartHeader color={Colors.teal}>
          Current Projection
          <ProjectionsLegend />
        </ChartHeader>
        <CurveChart
          chartHeight={250}
          hideAxes={false}
          yAxisExtent={[0, maxValue]}
          hospitalBeds={systemWideData.hospitalBeds}
          markColors={MarkColors}
          curveData={currentCurveData}
        />
      </CurveChartContainer>
    </>
  );
};

export default ProjectionCharts;
