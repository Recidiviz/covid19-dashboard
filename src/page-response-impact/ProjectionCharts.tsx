import React from "react";
import styled from "styled-components";

import Colors, { MarkColors } from "../design-system/Colors";
import CurveChart from "../impact-dashboard/CurveChart";
import { CurveFunctionInputs } from "../infection-model";
import ProjectionsLegend from "../page-multi-facility/ProjectionsLegend";
import { getCurveChartData, SystemWideData } from "./responseChartData";
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
          hospitalBeds={systemWideData.hospitalBeds}
          markColors={MarkColors}
          curveData={getCurveChartData(originalCurveInputs)}
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
          hospitalBeds={systemWideData.hospitalBeds}
          markColors={MarkColors}
          curveData={getCurveChartData(currentCurveInputs)}
        />
      </CurveChartContainer>
    </>
  );
};

export default ProjectionCharts;
