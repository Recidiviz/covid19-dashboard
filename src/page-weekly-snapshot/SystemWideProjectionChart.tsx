import React from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
// import {
//   BorderDiv,
//   HorizontalRule,
//   Left,
//   LeftHeading,
//   Right,
//   Table,
//   TableCell,
//   TableHeadingCell,
//   TextContainer,
//   TextContainerHeading,
// } from "./shared";

const SystemWideProjectionChartContainer = styled.div`
  font-size: 12px;
  font-weight: 400;
  padding: 20px 0;
`;

const CurveChartContainer = styled.div`
  margin-bottom: 50px;
`;

export const ChartHeader = styled.h3`
  color: ${Colors.black};
  font-family: "Libre Franklin";
  font-style: normal;
  font-weight: 700;
  font-size: 11px;
  line-height: 13px;
`;

const SystemWideProjectionChart: React.FC = () => {
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
