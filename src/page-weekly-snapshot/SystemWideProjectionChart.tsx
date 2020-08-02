import { curveCatmullRom, scaleTime } from "d3";
import * as dateFns from "date-fns";
import React from "react";
import { ResponsiveXYFrame } from "semiotic";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import { useFacilities } from "../facilities-context";
import { useLocaleDataState } from "../locale-data-context";
import {
  CHART_MARGINS,
  ChartHeader,
  HorizontalRule,
  LegendContainer,
  LegendText,
} from "./shared";
import * as chartUtils from "./shared/projectionChartUtils";
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
  height: 500px;
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
  const maxValue = Math.max(...activeCases);
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
    yExtent: [0, maxValue + 50],
    margin: CHART_MARGINS,
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
        label: "Projected active cases",
      },
    ],
    annotationSettings: {
      layout: {
        type: "bump",
        padding: -5,
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
            align: "top",
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
              Projected Cases
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
