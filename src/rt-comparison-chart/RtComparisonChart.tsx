import flatten from "lodash/flatten";
import numeral from "numeral";
import React from "react";
import { ResponsiveOrdinalFrame } from "semiotic";
import styled from "styled-components";

import ChartTooltip from "../design-system/ChartTooltip";
import ChartWrapper from "../design-system/ChartWrapper";
import Colors, { rtPillColors } from "../design-system/Colors";
import { rtSpreadType } from "../infection-model/rt";

const RtComparisonChartWrapper = styled(ChartWrapper)``;

const RtComparisonChartTooltip = styled(ChartTooltip)`
  position: absolute;
  max-width: 240px;

  p {
    color: ${Colors.white};
    font-size: 12px;
    font-weight: normal;
    margin-bottom: 0.8em;
    opacity: 0.8;
  }
`;

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

const getRtColors = (rtValue: number) => {
  return rtPillColors[rtSpreadType(rtValue)];
};

const borderColorScale = (rtValue: number) => {
  return getRtColors(rtValue).border;
};

const textColorScale = (rtValue: number) => {
  return getRtColors(rtValue).text;
};

const formatRt = (value: number) => numeral(value).format("0.0[0]");

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
    const values = markRecord.data.values;
    const noData = values.Rt === undefined;
    return (
      <g key={markRecord.renderKey}>
        {!noData && (
          <CI90Line
            stroke={borderColorScale(values.Rt)}
            x1={rScale(values.low90)}
            x2={rScale(values.high90)}
            y1={d.middle}
            y2={d.middle}
          />
        )}
        <RtPill
          cx={rScale(values.Rt || 0)}
          cy={d.middle}
          r={pillRadius}
          stroke={borderColorScale(values.Rt)}
        />
        <RtLabel
          fill={textColorScale(values.Rt)}
          x={rScale(values.Rt || 0)}
          y={d.middle}
        >
          {noData ? "?" : formatRt(values.Rt)}
        </RtLabel>
      </g>
    );
  });
  return flatten(elementsToRender);
};

const Tooltip: React.FC<{
  name: string;
  rt: number | undefined;
  left: number;
  top: number;
}> = ({ name, rt, left, top }) => {
  return (
    <RtComparisonChartTooltip style={{ left, top }}>
      <p>{name}</p>
      <p>
        {!!rt && `Rate of Spread: ${formatRt(rt)}`}
        {rt === undefined &&
          `Insufficient data to calculate rate of spread. Click the number of
          cases on the Projections tab to add case numbers for the last several
          days or weeks.`}
        {rt === 0 && "Covid-19 is not active at this facility."}
      </p>
      <p>
        Numbers above 1 indicate how quickly the virus is spreading. If the
        value is below 1, the virus is on track to be extinguished at this
        facility.
      </p>
    </RtComparisonChartTooltip>
  );
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

const renderHtmlOLabels = ({ categories }: { categories: any }) => {
  return (
    <OLabelContainer key="ordinalAxisLabels">
      {Object.values(categories).map((category: any) => (
        <OLabel key={category.pieces[0].renderKey}>
          <OLabelText>{category.name}</OLabelText>
        </OLabel>
      ))}
    </OLabelContainer>
  );
};

const renderHtmlHoverState = ({
  d: {
    column: { middle, pieces },
  },
  rScale,
}: any) => {
  const [
    {
      data: { name, values },
    },
  ] = pieces;
  return (
    <Tooltip
      key="hover-tooltip"
      name={name}
      rt={values.Rt}
      top={middle - pillRadius}
      left={rScale(values.Rt) | 0}
    />
  );
};

const htmlAnnotationRules = (args: {
  d: any;
  categories: any;
  rScale: Function;
}) => {
  const { d, categories, rScale } = args;
  switch (d.type) {
    case "htmlOLabels":
      return renderHtmlOLabels({ categories });
    case "column-hover":
      return renderHtmlHoverState({ d, rScale });
  }
  return null;
};

const HoverRule = styled.line`
  stroke-width: 1px;
  stroke-opacity: 0.2;
`;

const renderSvgHoverState = ({ d, rScale }: any) => {
  const {
    column: {
      middle,
      pieces: [
        {
          data: { values },
        },
      ],
    },
  } = d;
  return values.low90 ? (
    <HoverRule
      key="hover-rule"
      stroke={borderColorScale(values.Rt)}
      x1={rScale(0)}
      x2={rScale(values.low90)}
      y1={middle}
      y2={middle}
    />
  ) : null;
};

const svgAnnotationRules = (args: { d: any; rScale: Function }) => {
  const { d, rScale } = args;
  switch (d.type) {
    case "column-hover":
      return renderSvgHoverState({ d, rScale });
  }
  return null;
};

export type RtComparisonData = {
  name: string;
  id: string;
  values: {
    Rt?: number;
    low90?: number;
    high90?: number;
  };
};

export const isRtComparisonData = (
  x: RtComparisonData | undefined,
): x is RtComparisonData => x !== undefined;

const RtComparisonChart: React.FC<{ data: RtComparisonData[] }> = ({
  data,
}) => {
  const maxRtHigh90 = Math.ceil(
    Math.max(...data.map((record) => record.values.high90 || 0)),
  );

  const maxExtent = maxRtHigh90 >= 4 ? maxRtHigh90 + 1 : 5;

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
        data={data}
        hoverAnnotation
        htmlAnnotationRules={htmlAnnotationRules}
        margin={margin}
        oAccessor="name"
        pixelColumnWidth={oLabelHeight}
        projection="horizontal"
        rAccessor="values"
        rExtent={[0, maxExtent]}
        renderKey="id"
        responsiveWidth
        size={[300]}
        svgAnnotationRules={svgAnnotationRules}
        type={PillsWithConfidenceIntervals}
      />
    </RtComparisonChartWrapper>
  );
};

export default RtComparisonChart;
