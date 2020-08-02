import { curveCatmullRom, format } from "d3";
import { add, format as formatDate } from "date-fns";
import { flatten, pick } from "lodash";
import React from "react";
import { ResponsiveXYFrame } from "semiotic";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import { CurveData } from "../infection-model";
import { SeirCompartmentKeys } from "../infection-model/seir";
import { useChartDataFromProjectionData } from "../page-multi-facility/projectionCurveHooks";
import {
  CHART_MARGINS,
  ChartHeader,
  ChartHeaderContainer,
  HorizontalRule,
  LegendContainer,
  LegendText,
} from "./shared";

const CurveChartWrapper = styled.div`
  height: 500px;

  .axis.x {
    stroke-width: 0.25px;
  }
`;

const ChartContainer = styled.div`
  font-size: 12px;
  font-weight: 400;
  margin-bottom: 50px;
`;

interface ProjectionProps {
  curveData: CurveData | undefined;
}

export interface ChartData {
  [key: string]: number[];
}

const formatThousands = format(",~g");

const legendColors: { [key in string]: string } = {
  exposed: Colors.green,
  infectious: Colors.lightBlue,
  hospitalized: Colors.darkRed,
  fatalities: Colors.black,
};

const FacilityProjectionChart: React.FC<ProjectionProps> = ({ curveData }) => {
  const chartData = pick(
    useChartDataFromProjectionData(curveData),
    Object.keys(legendColors),
  ) as ChartData;

  const allValues: number[] = flatten(Object.values(chartData));
  const maxValue = allValues && Math.max(...allValues);

  if (!chartData) return null;

  const frameProps = {
    lines: Object.entries(chartData).map(([bucket, values]) => ({
      title: bucket,
      key: bucket,
      coordinates: values?.map((count, index) => ({
        count,
        date: add(new Date(), { days: index }),
      })),
    })),
    renderKey: (d: any, i: number) => d.key || i,
    lineType: { type: "line", interpolator: curveCatmullRom },
    xAccessor: "date",
    yAccessor: "count",
    responsiveHeight: true,
    responsiveWidth: true,
    yExtent: [0, maxValue + 100],
    margin: CHART_MARGINS,
    lineStyle: ({ key }: { key: SeirCompartmentKeys }) => ({
      stroke: legendColors[key],
      strokeWidth: 2,
      fill: legendColors[key],
      fillOpacity: 1,
    }),
    axes: [
      {
        orient: "bottom",
        ticks: 5,
        tickFormat: (value: Date) => formatDate(new Date(value), "MM/dd"),
      },
      {
        orient: "left",
        label: "Number of people",
        baseline: false,
        tickLineGenerator: () => null,
        tickFormat: formatThousands,
      },
    ],
    showLinePoints: false,
    pointStyle: { display: "none" },
  };
  return (
    <ChartContainer>
      <HorizontalRule />
      <ChartHeaderContainer>
        <ChartHeader>Estimated Impact</ChartHeader>
        <LegendContainer>
          <LegendText legendColor={legendColors.exposed}>Exposed</LegendText>
          <LegendText legendColor={legendColors.infectious}>
            Infectious
          </LegendText>
          <LegendText legendColor={legendColors.hospitalized}>
            Hospitalized
          </LegendText>
          <LegendText legendColor={legendColors.fatalities}>
            Fatalities
          </LegendText>
        </LegendContainer>
      </ChartHeaderContainer>
      <HorizontalRule />
      <CurveChartWrapper>
        <ResponsiveXYFrame {...frameProps} />
      </CurveChartWrapper>
    </ChartContainer>
  );
};

export default FacilityProjectionChart;
