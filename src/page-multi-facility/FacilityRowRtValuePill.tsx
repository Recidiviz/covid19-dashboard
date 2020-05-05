import React from "react";
import styled from "styled-components";

import { RateOfSpreadType } from "../constants/EpidemicModel";
import ChartTooltip from "../design-system/ChartTooltip";
import Colors from "../design-system/Colors";
import PillCircle from "../design-system/PillCircle";
import {
  TooltipContents,
  TooltipLabel,
  TooltipValue,
} from "../rt-timeseries/RtTimeseries";

const pillColors: {
  [x: string]: {
    [x: string]: string;
  };
} = {
  [RateOfSpreadType.CONTROLLED]: {
    text: Colors.green,
    border: Colors.teal,
  },
  [RateOfSpreadType.INFECTIOUS]: {
    text: Colors.darkRed,
    border: Colors.orange,
  },
  [RateOfSpreadType.MISSING]: {
    text: Colors.forest,
    border: Colors.forest30,
  },
};

const RtValuePill = styled.div<{ spreadType: string }>`
  .pill-circle {
    border-color: ${(props) => pillColors[props.spreadType].border};
    color: ${(props) => pillColors[props.spreadType].text};
  }

  &:hover {
    .tooltip-wrapper {
      display: block;
    }
  }
`;

const PillTooltip = styled.div`
  position: relative;

  .tooltip-wrapper {
    display: none;
    max-width: 260px;
    position: absolute;
    right: 0px;
    transform: translateY(calc(-100% - 4px)) translateX(2px);

    &:after {
      left: calc(100% - 21px);
    }
  }
  .tooltip-label-content {
    white-space: pre-wrap;
  }
`;

interface Props {
  latestRt: number | null | undefined;
}

const rtSpreadType = (latestRt: number | null | undefined) => {
  if (!latestRt) {
    return RateOfSpreadType.MISSING;
  } else if (latestRt > 1) {
    return RateOfSpreadType.INFECTIOUS;
  } else {
    return RateOfSpreadType.CONTROLLED;
  }
};

const displayRtValue = (latestRt: number | null | undefined) => {
  return !latestRt ? "?" : latestRt.toFixed(1);
};

const FacilityRowRtValuePill: React.FC<Props> = ({ latestRt: latestRt }) => {
  const hasDataTitle = `Rate of spread (Rt): ${latestRt}`;
  const needsDataTitle = `Not enough data`;
  const hasDataBody = `Numbers above 1 indicate how quickly the virus is spreading. If the value is below 1, the virus is on track to be extinguished at this facility.`;
  const needsDataBody = `To calculate the rate of transmission, enter more than one day of facility case data.`;

  return (
    <>
      <RtValuePill spreadType={rtSpreadType(latestRt)}>
        <PillTooltip>
          <ChartTooltip className="tooltip-wrapper">
            <TooltipContents>
              <TooltipValue>
                {!!latestRt ? hasDataTitle : needsDataTitle}
              </TooltipValue>
              <TooltipLabel className="tooltip-label-content">
                {!!latestRt ? hasDataBody : needsDataBody}
              </TooltipLabel>
            </TooltipContents>
          </ChartTooltip>
        </PillTooltip>
        <PillCircle className="pill-circle">
          {displayRtValue(latestRt)}
        </PillCircle>
      </RtValuePill>
    </>
  );
};

export default FacilityRowRtValuePill;
