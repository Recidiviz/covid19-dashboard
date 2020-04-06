// @ts-nocheck

import { curveCatmullRom, format } from "d3";
import ResponsiveXYFrame from "semiotic/lib/ResponsiveXYFrame";
import styled from "styled-components";

import colors from "../design-system/colors";

const ChartContainer = styled.div`
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

const triangleSize = "7";
const TooltipContainer = styled.div`
  background: ${colors.forest};
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
    border-top: ${triangleSize}px solid ${colors.forest};
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

function Tooltip({ count, days, parentLine: { title } }) {
  return (
    <TooltipContainer>
      <TooltipTitle>{title}</TooltipTitle>
      <TooltipDatalist>
        <TooltipDatum>Days: {days}</TooltipDatum>
        <TooltipDatum>People: {formatThousands(count)}</TooltipDatum>
      </TooltipDatalist>
    </TooltipContainer>
  );
}

export default function CurveChart({ curveData, hospitalBeds, markColors }) {
  const frameProps = {
    lines: Object.entries(curveData).map(([bucket, values]) => ({
      title: bucket,
      key: bucket,
      coordinates: values.map((count, index) => ({
        count,
        days: index + 1,
      })),
    })),
    lineType: { type: "area", interpolator: curveCatmullRom },
    xAccessor: "days",
    yAccessor: "count",
    responsiveWidth: true,
    size: [450, 450],
    yExtent: { extent: [0], includeAnnotations: true },
    margin: { left: 60, bottom: 60, right: 10, top: 0 },
    lineStyle: ({ key }) => ({
      stroke: markColors[key],
      strokeWidth: 1,
      fill: markColors[key],
      fillOpacity: 0.1,
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
        color: markColors.hospitalBeds,
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
}
