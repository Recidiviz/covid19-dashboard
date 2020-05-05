import { scaleTime, timeFormat } from "d3";
import hexAlpha from "hex-alpha";
import numeral from "numeral";
// no type defs for Semiotic
const ResponsiveXYFrame = require("semiotic/lib/ResponsiveXYFrame") as any;
import React from "react";
import styled from "styled-components";

import ChartTooltip from "../design-system/ChartTooltip";
import ChartWrapper from "../design-system/ChartWrapper";
import Colors, { lighten } from "../design-system/Colors";
import { RtData, RtRecord } from "../infection-model/rt";

interface Props {
  data: RtData;
}

type Line = {
  confidenceInterval?: boolean;
  data: RtRecord[];
  title: string;
};

const formatDate = timeFormat("%B %-d");

const borderStyle = `1px solid ${Colors.paleGreen}`;
const RtTimeseriesWrapper = styled(ChartWrapper)`
  .uncertainty {
    fill: ${Colors.darkGray};
    fill-opacity: 0.3;
  }
`;

export const ChartTitle = styled.div`
  border-bottom: ${borderStyle};
  color: ${hexAlpha(Colors.forest, 0.7)};
  font-family: "Poppins", sans-serif;
  font-size: 9px;
  font-weight: 600;
  padding: 5px 0;
`;

export const TooltipContents = styled.div`
  font-family: "Poppins", sans-serif;
  text-align: center;
  white-space: nowrap;
`;

export const TooltipLabel = styled.div`
  color: ${Colors.gray};
  line-height: 1.5;
  font-size: 11px;
  font-weight: normal;
`;
export const TooltipValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const Tooltip: React.FC<{
  data: RtRecord;
  parentLine: { title: string };
}> = (props) => {
  const {
    data: { date, value },
    parentLine: { title },
  } = props;
  return (
    <ChartTooltip>
      <TooltipContents>
        <TooltipValue>{numeral(value).format("0.0")}</TooltipValue>
        <TooltipLabel>
          {title} {formatDate(date)}
        </TooltipLabel>
      </TooltipContents>
    </ChartTooltip>
  );
};

const RtTimeseries: React.FC<Props> = ({ data }) => {
  const getLines = (): Line[] => {
    return [
      { title: "R(t)", data: data.Rt },
      {
        title: "90% CI (low)",
        confidenceInterval: true,
        data: data.low90,
      },
      {
        title: "90% CI (high)",
        confidenceInterval: true,
        data: data.high90,
      },
    ];
  };

  return (
    <RtTimeseriesWrapper>
      <ChartTitle>Rate of Spread</ChartTitle>
      <ResponsiveXYFrame
        annotations={[
          {
            type: "area",
            className: "uncertainty",
            coordinates: [
              // assuming these are sorted in date order this makes a clean shape
              ...data.high90,
              ...[...data.low90].reverse(),
            ],
          },
          {
            color: lighten(Colors.red, 30),
            disable: ["connector"],
            type: "y",
            value: 1,
          },
        ]}
        hoverAnnotation={[
          {
            type: "x",
            disable: ["connector", "note"],
            color: Colors.darkGray,
          },
          { type: "frame-hover" },
        ]}
        lineDataAccessor="data"
        lines={getLines()}
        lineStyle={(d: Line) => ({
          stroke: Colors.forest,
          strokeWidth: d.confidenceInterval ? 0 : 1,
        })}
        margin={{ left: 0, bottom: 0, right: 0, top: 0 }}
        responsiveWidth
        size={[300, 200]}
        tooltipContent={Tooltip}
        xAccessor="date"
        xScaleType={scaleTime()}
        yAccessor="value"
        yExtent={[0]}
      />
    </RtTimeseriesWrapper>
  );
};

export default RtTimeseries;
