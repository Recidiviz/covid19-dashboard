// @ts-nocheck

import { curveCatmullRom, format } from "d3";
import ResponsiveXYFrame from "semiotic/lib/ResponsiveXYFrame";
import styled from "styled-components";

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

  .tooltip-content {
    background: white;
    position: relative;
    border: 1px solid #ddd;
    color: black;
    padding: 10px;
    z-index: 100;
    transform: translateX(-50%) translateY(5px);
    min-width: 120px;
  }

  .threshold-annotation {
    .subject {
      stroke-dasharray: 1 3;
      stroke-linecap: round;
    }
  }
`;

export default function CurveChart({ curveData, hospitalBeds, markColors }) {
  const lines = Object.entries(curveData).map(([bucket, values]) => ({
    title: bucket,
    key: bucket,
    coordinates: values.map((count, index) => ({
      count,
      days: index + 1,
    })),
  }));

  // make sure the Y axis includes hospital beds threshold
  const maxCurvePeak = lines.reduce(
    (highestPeak, { coordinates }) =>
      Math.max(
        highestPeak,
        coordinates.reduce(
          (linePeak, { count }) => Math.max(linePeak, count),
          0,
        ),
      ),
    0,
  );
  const yMax = Math.ceil(Math.max(hospitalBeds, maxCurvePeak) / 1000) * 1000;

  const frameProps = {
    lines,
    lineType: { type: "area", interpolator: curveCatmullRom },
    xAccessor: "days",
    yAccessor: "count",
    responsiveWidth: true,
    size: [450, 450],
    yExtent: [0, yMax],
    margin: { left: 80, bottom: 90, right: 10, top: 40 },
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
        tickFormat: format(",.0f"),
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
  };

  return (
    <ChartContainer>
      <ResponsiveXYFrame {...frameProps} />
    </ChartContainer>
  );
}
