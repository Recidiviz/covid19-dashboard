import React from "react";
import { useState } from "react";
import styled from "styled-components";

import { ProjectionColors } from "../design-system/Colors";
import { CurveToggles } from "../page-multi-facility/curveToggles";
import { ChartData } from "./CurveChart";
import CurveChartContainer from "./CurveChartContainer";
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
  initialCurveToggles: CurveToggles;
  markColors: ProjectionColors;
  chartData?: ChartData;
  addAnnotations?: boolean;
  hospitalBeds?: number;
}> = ({
  initialCurveToggles,
  markColors,
  chartData,
  addAnnotations,
  hospitalBeds,
}) => {
  const [groupStatus, setGroupStatus] = useState(initialCurveToggles);

  const toggleGroup = (groupName: keyof typeof groupStatus) => {
    setGroupStatus({ ...groupStatus, [groupName]: !groupStatus[groupName] });
  };

  return (
    <Container>
      <LegendAndActions>
        <LegendTitle>projection</LegendTitle>
        <LegendContainer>
          <CurveChartLegend
            markColors={markColors}
            toggleGroup={toggleGroup}
            groupStatus={groupStatus}
          />
        </LegendContainer>
      </LegendAndActions>
      <CurveChartContainer
        curveData={chartData}
        groupStatus={groupStatus}
        markColors={markColors}
        hospitalBeds={hospitalBeds}
        addAnnotations={addAnnotations}
      />
    </Container>
  );
};

export default ChartArea;
