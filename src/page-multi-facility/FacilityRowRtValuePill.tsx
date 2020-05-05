import numeral from "numeral";
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

const RtValuePill = styled.div<{ spreadType: RateOfSpreadType }>`
  ${PillCircle} {
    border-color: ${(props) => pillColors[props.spreadType].border};
    color: ${(props) => pillColors[props.spreadType].text};
  }

  &:hover {
    ${ChartTooltip} {
      display: block;
    }
  }
`;

const PillTooltip = styled.div`
  position: relative;

  ${ChartTooltip} {
    display: none;
    max-width: 260px;
    position: absolute;
    right: 0px;
    transform: translateY(calc(-100% - 4px)) translateX(2px);

    &:after {
      left: calc(100% - 21px);
    }
  }

  ${TooltipLabel} {
    white-space: pre-wrap;
  }
`;

interface Props {
  latestRt: number | null | undefined;
}

const rtSpreadType = (latestRt: number | null | undefined) => {
  if (latestRt === null || latestRt === undefined) {
    return RateOfSpreadType.Missing;
  } else if (latestRt > 1) {
    return RateOfSpreadType.Infectious;
  } else {
    return RateOfSpreadType.Controlled;
  }
};

const isValidRt = (rtValue: number | null | undefined) =>
  rtValue !== null && rtValue !== undefined;

const displayRtValue = (latestRt: number | null | undefined) => {
  return isValidRt(latestRt) ? numeral(latestRt).format("0.0") : "?";
};

const FacilityRowRtValuePill: React.FC<Props> = ({ latestRt: latestRt }) => {
  const hasDataTitle = `Rate of spread (Rt): ${displayRtValue(latestRt)}`;
  const needsDataTitle = `Not enough data`;
  const hasDataBody = `Numbers above 1 indicate how quickly the virus is spreading. If the value is below 1, the virus is on track to be extinguished at this facility.`;
  const needsDataBody = `To calculate the rate of transmission, enter more than one day of facility case data.`;

  return (
    <>
      <RtValuePill spreadType={rtSpreadType(latestRt)}>
        <PillTooltip>
          <ChartTooltip>
            <TooltipContents>
              <TooltipValue>
                {isValidRt(latestRt) ? hasDataTitle : needsDataTitle}
              </TooltipValue>
              <TooltipLabel>
                {isValidRt(latestRt) ? hasDataBody : needsDataBody}
              </TooltipLabel>
            </TooltipContents>
          </ChartTooltip>
        </PillTooltip>
        <PillCircle>{displayRtValue(latestRt)}</PillCircle>
      </RtValuePill>
    </>
  );
};

export default FacilityRowRtValuePill;
