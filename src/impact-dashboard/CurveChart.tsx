// @ts-nocheck
import { curveCatmullRom, format } from "d3";
import { add } from "date-fns";
import React from "react";
import ResponsiveXYFrame from "semiotic/lib/ResponsiveXYFrame";
import styled from "styled-components";

import ChartTooltip from "../design-system/ChartTooltip";
import ChartWrapper from "../design-system/ChartWrapper";
import { DateMMMMdyyyy } from "../design-system/DateFormats";
import { MarkColors } from "./ChartArea";

const CurveChartWrapper = styled(ChartWrapper)`
  height: ${(props) => props.chartHeight}px;

  .threshold-annotation {
    .subject {
      stroke-dasharray: 1 3;
      stroke-linecap: round;
    }
  }
`;

const TooltipTitle = styled.div`
  font-size: 9px;
  font-weight: bold;
  letter-spacing: 0.1em;
  line-height: 1;
  margin-bottom: 12px;
  text-transform: uppercase;
`;

const TooltipDatalist = styled.ul``;
const TooltipDatum = styled.li`
  opacity: 0.8;
`;

// Note:
// if tick value = 1,001.00, displays 1001
// if tick value = 2.5, displays 2.5
const formatThousands = format(",~g");

interface TooltipProps {
  countTotal: number;
  countIncarcerated: number;
  countStaff: number;
  days: number;
  parentLine: {
    title: string;
    [propName: string]: any;
  };
  [propName: string]: any;
}

const Tooltip: React.FC<TooltipProps> = ({
  countIncarcerated,
  countStaff,
  days,
  parentLine: { title },
}) => {
  const displayDate = add(new Date(), { days });

  return (
    <ChartTooltip>
      <TooltipTitle>{title}</TooltipTitle>
      <TooltipDatalist>
        <TooltipDatum>
          <DateMMMMdyyyy date={displayDate} />
        </TooltipDatum>
        <TooltipDatum>
          Incarcerated: {formatThousands(countIncarcerated)}
        </TooltipDatum>
        <TooltipDatum>Staff: {formatThousands(countStaff)}</TooltipDatum>
      </TooltipDatalist>
    </ChartTooltip>
  );
};

export interface ChartData {
  [key: string]: number[] | undefined;
}

interface CurveChartProps {
  curveData: ChartData;
  chartHeight?: number;
  hospitalBeds: number;
  markColors: MarkColors;
  hideAxes?: boolean;
  yAxisExtent?: number[];
  addAnnotations?: boolean;
}

const xAxisOptions: any[] = [
  {
    orient: "bottom",
    tickLineGenerator: () => null,
    label: "Days",
    tickValues: [0, 25, 50, 75, 100],
  },
  {
    tickLineGenerator: () => null,
  },
];

const yAxisOptions: any[] = [
  {
    orient: "left",
    baseline: false,
    tickFormat: formatThousands,
  },
  {
    baseline: false,
    ticks: 5,
  },
];

const CurveChart: React.FC<CurveChartProps> = ({
  curveData,
  chartHeight,
  hospitalBeds,
  markColors,
  hideAxes,
  yAxisExtent = [0],
  addAnnotations = true,
}) => {
  const frameProps = {
    lines: Object.entries(curveData).map(([bucket, values]) => ({
      title: bucket,
      key: bucket,
      coordinates: values.map((count, index) => ({
        countTotal: count.total,
        countIncarcerated: count.incarcerated,
        countStaff: count.staff,
        days: index,
      })),
    })),
    renderKey: (d, i) => d.key || i,
    lineType: { type: "area", interpolator: curveCatmullRom },
    xAccessor: "days",
    yAccessor: "countTotal",
    responsiveHeight: true,
    responsiveWidth: true,
    size: [450, 450],
    yExtent: { extent: yAxisExtent, includeAnnotations: false },
    margin: hideAxes
      ? { top: 5 }
      : { left: 60, bottom: 60, right: 10, top: 10 },
    lineStyle: ({ key }) => ({
      stroke: markColors[key],
      strokeWidth: 1,
      fill: markColors[key],
      fillOpacity: 0.1,
    }),
    axes: [
      hideAxes ? yAxisOptions[1] : yAxisOptions[0],
      hideAxes ? xAxisOptions[1] : xAxisOptions[0],
    ],
    annotations: [
      addAnnotations
        ? {
            type: "y",
            className: "threshold-annotation",
            count: hospitalBeds,
            color: markColors.hospitalBeds,
            note: { label: "Hospital Beds", lineType: null, dy: 1, dx: 0 },
            disable: ["connector"],
          }
        : {},
    ],
    svgAnnotationRules: ({ d, yScale }) => {
      if (d.type === "y") {
        // don't try to render hospital beds that won't fit in the chart;
        // otherwise they might be visible
        if (d.count > yScale.domain()[1]) {
          return;
        }
      }
      return null;
    },
    hoverAnnotation: true,
    tooltipContent: Tooltip,
    // these two options place the hover targets along the line
    // (rather in the center of the area) but keep them invisible
    showLinePoints: "top",
    pointStyle: { display: "none" },
  };

  return (
    <CurveChartWrapper chartHeight={chartHeight || 380}>
      <ResponsiveXYFrame {...frameProps} />
    </CurveChartWrapper>
  );
};

export default CurveChart;
