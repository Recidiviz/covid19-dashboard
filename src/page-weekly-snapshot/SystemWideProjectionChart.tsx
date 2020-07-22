import React from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import { useFacilities } from "../facilities-context";
import { Heading } from "./shared/index";
import SystemWideSummaryTable from "./SystemWideSummaryTable";
import { useWeeklyReport } from "./weekly-report-context";

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
      <SystemWideSummaryTable />
      <CurveChartContainer>
        <Heading>
          System-Wide Projection for Facilities with Active Cases
        </Heading>
      </CurveChartContainer>
    </SystemWideProjectionChartContainer>
  );
};

export default SystemWideProjectionChart;
