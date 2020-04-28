import { scaleTime, timeFormat } from "d3";
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

const formatDate = timeFormat("%-d %B");

const RtTimeseriesWrapper = styled(ChartWrapper)`
  .uncertainty {
    fill: ${Colors.darkGray};
    fill-opacity: 0.3;
  }
`;

const TooltipContents = styled.div`
  text-align: center;
  white-space: nowrap;
`;

const TooltipLabel = styled.div``;
const TooltipValue = styled.div`
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
        <TooltipValue>{value}</TooltipValue>
        <TooltipLabel>{title}</TooltipLabel>
        <TooltipLabel>{formatDate(date)}</TooltipLabel>
      </TooltipContents>
    </ChartTooltip>
  );
};

const RtTimeseries: React.FC<Props> = ({ data }) => {
  const getLines = (): Line[] => {
    return [
      { title: "R(t)", data: data.Rt },
      {
        title: "90% Confidence Interval (low)",
        confidenceInterval: true,
        data: data.low90,
      },
      {
        title: "90% Confidence Interval (high)",
        confidenceInterval: true,
        data: data.high90,
      },
    ];
  };

  return (
    <RtTimeseriesWrapper>
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
        axes={[
          {
            label: { name: "Rate of spread", locationDistance: 30 },
            orient: "left",
            tickLineGenerator: () => null,
          },
        ]}
        hoverAnnotation
        lineDataAccessor="data"
        lines={getLines()}
        lineStyle={(d: Line) => ({
          stroke: Colors.forest,
          strokeWidth: d.confidenceInterval ? 0 : 1,
        })}
        margin={{ left: 40, bottom: 5, right: 10, top: 5 }}
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
