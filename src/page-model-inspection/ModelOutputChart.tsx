// @ts-nocheck
import { sentenceCase } from "change-case";
import { curveCatmullRom, format } from "d3";
import { add } from "date-fns";
import React from "react";
import ResponsiveXYFrame from "semiotic/lib/ResponsiveXYFrame";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import { DateMMMMdyyyy } from "../design-system/DateFormats";
import { getMarkColor } from "./helpers";

const ChartContainer = styled.div`
  height: 850px;

  .frame {
    font-family: "Poppins", sans-serif;
    font-size: 11px;
    font-weight: 300;
    letter-spacing: 0;
  }

  .axis-baseline,
  .tick {
    stroke: #467472;
  }

  .tick {
    stroke-opacity: 0.2;
  }

  .axis-baseline {
    stroke-width: 2px;
  }

  .axis-title text,
  .axis-label {
    fill: #00413e;
    font-weight: 400;
    opacity: 0.7;
  }

  .axis-label {
    font-size: 10px;
  }

  .threshold-annotation {
    .subject {
      stroke-dasharray: 1 3;
      stroke-linecap: round;
    }
  }

  circle.frame-hover {
    display: none;
  }
`;

const triangleSize = 7;
const TooltipContainer = styled.div`
  background: ${Colors.forest};
  color: #fff;
  font-family: "Rubik", sans-serif;
  min-width: 120px;
  padding: 12px;
  position: relative;
  transform: translateX(-50%) translateY(calc(-100% - ${2 * triangleSize}px));
  z-index: 100;

  &::after {
    border-left: ${triangleSize}px solid transparent;
    border-right: ${triangleSize}px solid transparent;
    border-top: ${triangleSize}px solid ${Colors.forest};
    bottom: -${triangleSize}px;
    content: "";
    display: block;
    height: 0;
    left: calc(50% - ${triangleSize}px);
    position: absolute;
    width: 0;
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

const formatThousands = format(",.0f");

interface TooltipProps {
  count: number;
  days: number;
  parentLine: {
    title: string;
    [propName: string]: any;
  };
  [propName: string]: any;
}

const Tooltip: React.FC<TooltipProps> = ({
  count,
  days,
  parentLine: { title },
}) => {
  const displayDate = add(new Date(), { days });

  return (
    <TooltipContainer>
      <TooltipTitle>{sentenceCase(title)}</TooltipTitle>
      <TooltipDatalist>
        <TooltipDatum>
          <DateMMMMdyyyy date={displayDate} />
        </TooltipDatum>
        <TooltipDatum>People: {formatThousands(count)}</TooltipDatum>
      </TooltipDatalist>
    </TooltipContainer>
  );
};

interface CurveChartProps {
  curveData: {
    [propName: string]: number[];
  };
  hospitalBeds: number;
}

const ModelOutputChart: React.FC<CurveChartProps> = ({
  curveData,
  hospitalBeds,
}) => {
  const frameProps = {
    lines: Object.entries(curveData).map(([compartment, values]) => ({
      title: compartment,
      key: compartment,
      coordinates: values.map((count, index) => ({
        count,
        days: index,
      })),
    })),
    lineType: { type: "line", interpolator: curveCatmullRom },
    xAccessor: "days",
    yAccessor: "count",
    responsiveHeight: true,
    responsiveWidth: true,
    size: [450, 450],
    yExtent: { extent: [0], includeAnnotations: true },
    margin: { left: 60, bottom: 60, right: 10, top: 0 },
    lineStyle: (d: object, i: number) => ({
      stroke: getMarkColor(i.toString()),
      strokeWidth: 1.5,
    }),
    axes: [
      {
        orient: "left",
        baseline: false,
        tickFormat: formatThousands,
      },
      {
        orient: "bottom",
        tickLineGenerator: () => null,
        label: "Days",
      },
    ],
    annotations: [
      {
        type: "y",
        className: "threshold-annotation",
        count: hospitalBeds,
        note: { label: "Hospital Beds", lineType: null, dy: 1, dx: 0 },
        disable: ["connector"],
      },
    ],
    hoverAnnotation: true,
    tooltipContent: Tooltip,
    // these two options place the hover targets along the line
    // (rather in the center of the area) but keep them invisible
    showLinePoints: "top",
    pointStyle: { display: "none" },
  };

  return (
    <ChartContainer>
      <ResponsiveXYFrame {...frameProps} />
    </ChartContainer>
  );
};

export default ModelOutputChart;
