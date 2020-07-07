import React from "react";
import { useState } from "react";
import styled from "styled-components";

import { ProjectionColors } from "../design-system/Colors";
import { CurveData } from "../infection-model";
import { CurveToggles } from "../page-multi-facility/curveToggles";
import { useChartDataFromProjectionData } from "../page-multi-facility/projectionCurveHooks";
import CurveChart from "./CurveChartContainer";
import CurveChartLegend from "./CurveChartLegend";

const Container = styled.div``;

const LegendAndActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 40px;
`;

const LegendContainer = styled.div`
  flex: 0 0 auto;
`;

const LegendTitle = styled.div`
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.15em;
  margin: 0 1em;
  font-weight: normal;
  padding-bottom: 0.6em;
`;

const ChartArea: React.FC<{
  projectionData?: CurveData;
  initialCurveToggles: CurveToggles;
  markColors: ProjectionColors;
  alternateTitle?: boolean;
}> = ({ projectionData, initialCurveToggles, markColors, alternateTitle }) => {
  const [groupStatus, setGroupStatus] = useState(initialCurveToggles);

  const toggleGroup = (groupName: keyof typeof groupStatus) => {
    setGroupStatus({ ...groupStatus, [groupName]: !groupStatus[groupName] });
  };

  const chartData = useChartDataFromProjectionData(projectionData);

  const title = alternateTitle ? "Estimated Impact" : "Projection";

  return (
    <Container>
      <LegendAndActions>
        <LegendTitle>{title}</LegendTitle>
        <LegendContainer>
          <CurveChartLegend
            markColors={markColors}
            toggleGroup={toggleGroup}
            groupStatus={groupStatus}
          />
        </LegendContainer>
      </LegendAndActions>
      <CurveChart
        curveData={chartData}
        groupStatus={groupStatus}
        markColors={markColors}
      />
    </Container>
  );
};

export default ChartArea;
