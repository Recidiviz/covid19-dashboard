import { curveCatmullRom, scaleTime } from "d3";
import * as dateFns from "date-fns";
import React from "react";
import { ResponsiveXYFrame } from "semiotic";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import { useFacilities } from "../facilities-context";
import { useLocaleDataState } from "../locale-data-context";
import * as chartUtils from "./projectionChartUtils";
import { HorizontalRule, LegendContainer, LegendText } from "./shared";
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

const HeaderContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: baseline;
`;

const CurveChartWrapper = styled.div`
  height: 400px;
  margin: 20px 0;

  .axis.x {
    stroke-width: 0.25px;
  }

  .axis.y {
    stroke-width: 0;
  }

  .annotation.label {
    font-family: "Libre Baskerville";
    font-size: 17px;
    letter-spacing: -0.01em;
    line-height: 17px;
    text-align: right;
  }
`;

export const ChartHeader = styled.h3`
  color: ${Colors.black};
  font-family: "Libre Franklin";
  font-style: normal;
  font-weight: 700;
  font-size: 11px;
  line-height: 13px;
`;

const legendColors = {
  projected: Colors.black,
  today: Colors.tamarillo,
};

const SystemWideProjectionChart: React.FC = () => {
  const { data: localeDataSource } = useLocaleDataState();
  const { state: facilitiesState } = useFacilities();
  const {
    state: { stateName, loading: scenarioLoading },
  } = useWeeklyReport();

  if (!stateName) return null;

  const facilities = Object.values(facilitiesState.facilities);
  const modelVersions = facilities.map((f) => f.modelVersions);

  if (!scenarioLoading && !facilitiesState.loading && !facilities.length) {
    return <div>Missing scenario data for state: {stateName}</div>;
  }

  const activeCases = chartUtils.get7DayProjectionChartData(
    modelVersions,
    localeDataSource,
  );
  const chartData = activeCases.map((cases, index) => {
    return {
      cases,
      date: dateFns.addDays(chartUtils.today(), index),
      color: index === 0 ? legendColors.today : legendColors.projected,
    };
  });

  const frameProps = {
    showLinePoints: true,
    lines: chartData,
    lineType: { type: "line", interpolator: curveCatmullRom },
    xAccessor: "date",
    yAccessor: "cases",
    xScaleType: scaleTime(),
    responsiveHeight: true,
    responsiveWidth: true,
    size: [450, 450],
    yExtent: [0],
    margin: { left: 60, bottom: 60, right: 60, top: 10 },
    lineStyle: {
      stroke: legendColors.projected,
      strokeWidth: 2,
      fill: legendColors.projected,
      fillOpacity: 1,
    },
    pointStyle: (d: any) => {
      return {
        fill: d.color,
        stroke: d.color,
        strokeWidth: 8,
      };
    },
    axes: [
      {
        orient: "bottom",
        baseline: "under",
        label: "Date",
        tickValues: chartData.map((d) => d.date),
        tickFormat: (d: any) => d.getMonth() + 1 + "/" + d.getDate(),
      },
      {
        orient: "left",
        baseline: false,
        label: "Active cases",
      },
    ],
    annotationSettings: {
      layout: {
        type: "bump",
        padding: -20,
      },
    },
    annotations: [
      ...chartData.map((data) => {
        return {
          type: "react-annotation",
          disable: ["connector"],
          note: {
            label: `${data.cases}`,
            orientation: "topBottom",
            align: "middle",
          },
          ...data,
        };
      }),
    ],
  };

  return (
    <SystemWideProjectionChartContainer>
      <SystemWideSummaryTable />
      <CurveChartContainer>
        <HorizontalRule />
        <HeaderContainer>
          <ChartHeader>
            System-Wide Projection for Facilities with Active Cases
          </ChartHeader>
          <LegendContainer>
            <LegendText legendColor={legendColors.projected}>
              Pessimistic Scenario
            </LegendText>
            <LegendText legendColor={legendColors.today}>
              Cases Today
            </LegendText>
          </LegendContainer>
        </HeaderContainer>
        <HorizontalRule />
        <CurveChartWrapper>
          <ResponsiveXYFrame {...frameProps} />
        </CurveChartWrapper>
      </CurveChartContainer>
    </SystemWideProjectionChartContainer>
  );
};

export default SystemWideProjectionChart;
