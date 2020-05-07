import flatten from "lodash/flatten";
import numeral from "numeral";
import React from "react";
import { ResponsiveOrdinalFrame } from "semiotic";
import styled from "styled-components";

import { RateOfSpreadType } from "../constants/EpidemicModel";
import ChartWrapper from "../design-system/ChartWrapper";
import Colors from "../design-system/Colors";

const RtComparisonChartWrapper = styled(ChartWrapper)``;

const CILine = styled.line`
  stroke-width: 3px;
`;

const CI90Line = styled(CILine)`
  stroke-opacity: 0.3;
`;

const RtPill = styled.circle`
  fill: #e9ecec;
  stroke-width: 1px;
`;

const RtLabel = styled.text`
  dominant-baseline: central;
  font-family: "Poppins", sans-serif;
  font-size: 14px;
  font-weight: 600;
  text-anchor: middle;
`;

// TODO: this is copypasta from the pill component, factor out for reuse
const pillColors: {
  [key in RateOfSpreadType]: {
    text: string;
    border: string;
  };
} = {
  [RateOfSpreadType.Controlled]: {
    text: Colors.green,
    border: Colors.teal,
  },
  [RateOfSpreadType.Infectious]: {
    text: Colors.darkRed,
    border: Colors.orange,
  },
  [RateOfSpreadType.Missing]: {
    text: Colors.forest,
    border: Colors.forest30,
  },
};

const rtSpreadType = (rtValue: number | null | undefined) => {
  if (rtValue === null || rtValue === undefined) {
    return RateOfSpreadType.Missing;
  } else if (rtValue > 1) {
    return RateOfSpreadType.Infectious;
  } else {
    return RateOfSpreadType.Controlled;
  }
};

const getRtColors = (rtValue: number) => {
  return pillColors[rtSpreadType(rtValue)];
};

const borderColorScale = (rtValue: number) => {
  return getRtColors(rtValue).border;
};

const textColorScale = (rtValue: number) => {
  return getRtColors(rtValue).text;
};

const pillRadius = 16;

const PillsWithConfidenceIntervals = ({
  data,
  rScale,
}: {
  data: any;
  rScale: (x: number) => number;
}) => {
  const elementsToRender = Object.values(data).map((d: any) => {
    // we've only provided one rAccessor, so we only expect one piece
    const markRecord = d.pieces[0];
    const noData = markRecord.data.Rt === undefined;
    return (
      <g key={markRecord.renderKey}>
        {!noData && (
          <CI90Line
            stroke={borderColorScale(markRecord.data.Rt)}
            x1={rScale(markRecord.data.low90)}
            x2={rScale(markRecord.data.high90)}
            y1={d.middle}
            y2={d.middle}
          />
        )}
        <RtPill
          cx={markRecord.middle}
          cy={d.middle}
          r={pillRadius}
          stroke={borderColorScale(markRecord.data.Rt)}
        />
        <RtLabel
          fill={textColorScale(markRecord.data.Rt)}
          x={markRecord.middle}
          y={d.middle}
        >
          {noData ? "?" : numeral(markRecord.data.Rt).format("0.0[0]")}
        </RtLabel>
      </g>
    );
  });
  return flatten(elementsToRender);
};

const margin = { top: 12, bottom: 30, left: 180, right: 12 };
const oLabelRightMargin = 6;
const oLabelOffset = margin.left;
const oLabelWidth = oLabelOffset - pillRadius - oLabelRightMargin;
const oLabelHeight = 50;

const OLabelContainer = styled.div`
  position: relative;
  left: -${margin.left}px;
  width: ${oLabelWidth}px;
`;

const OLabel = styled.div`
  align-items: center;
  color: ${Colors.forest};
  display: flex;
  font-size: 14px;
  font-weight: 600;
  height: ${oLabelHeight}px;
  width: ${oLabelWidth}px;
`;

const OLabelText = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: ${oLabelWidth}px;
`;

const renderHtmlOLabels = ({ d, categories }: { d: any; categories: any }) => {
  if (d.type === "htmlOLabels") {
    return (
      <OLabelContainer>
        {Object.values(categories).map((category: any) => (
          <OLabel key={category.pieces[0].renderKey}>
            <OLabelText>{category.name}</OLabelText>
          </OLabel>
        ))}
      </OLabelContainer>
    );
  }
  return null;
};

const RtComparisonChart: React.FC = () => {
  // TODO: not this
  const fakeData = [
    { name: "facility 1", id: "abc123", Rt: 1.9, low90: 0.4, high90: 3.8 },
    {
      name:
        "facility 2 what has a long name that may not fit on my god how long does it have to be",
      id: "def456",
      Rt: 0.6,
      low90: 0,
      high90: 1.5,
    },
    { name: "facility with no data and a long name", id: "xyz789" },
  ];
  return (
    <RtComparisonChartWrapper>
      <ResponsiveOrdinalFrame
        annotations={[
          { type: "htmlOLabels" },
          {
            type: "r",
            value: 1,
            color: Colors.darkRed,
            disable: ["connector"],
          },
        ]}
        axes={[{ orient: "bottom", baseline: false }]}
        data={fakeData}
        htmlAnnotationRules={renderHtmlOLabels}
        margin={margin}
        oAccessor="name"
        pixelColumnWidth={oLabelHeight}
        projection="horizontal"
        // our custom mark will consume the entire data structure,
        // but this ensures the chart's max extent will be big enough for everything
        rAccessor="high90"
        rExtent={[0]}
        renderKey="id"
        responsiveWidth
        size={[300]}
        type={PillsWithConfidenceIntervals}
      />
    </RtComparisonChartWrapper>
  );
};

export default RtComparisonChart;
