import numeral from "numeral";
import React from "react";
import styled from "styled-components";

import { RateOfSpreadType } from "../constants/EpidemicModel";
import ChartTooltip from "../design-system/ChartTooltip";
import { rtPillColors } from "../design-system/Colors";
import PillCircle from "../design-system/PillCircle";
import { rtSpreadType } from "../infection-model/rt";
import {
  TooltipContents,
  TooltipLabel,
  TooltipValue,
} from "../rt-timeseries/RtTimeseries";

const RtValuePill = styled.div<{ spreadType: RateOfSpreadType }>`
  ${PillCircle} {
    border-color: ${(props) => rtPillColors[props.spreadType].border};
    color: ${(props) => rtPillColors[props.spreadType].text};
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
    min-width: 260px;
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

const isValidRt = (rtValue: number | null | undefined) =>
  rtValue !== null && rtValue !== undefined;

const rtDisplayValue = (latestRt: number | null | undefined) => {
  return isValidRt(latestRt) ? numeral(latestRt).format("0.0") : "?";
};

const hasDataTitle = (latestRt: number | null | undefined) =>
  `Rate of spread (Rt): ${rtDisplayValue(latestRt)}`;
const needsDataTitle = "Insufficient data to calculate rate of spread.";
const hasDataBody =
  "Numbers above 1 indicate how quickly the virus is spreading. If the value is below 1, the virus is on track to be extinguished at this facility.";
const zeroRtDataTitle = "Covid-19 not active at this facility";
const needsDataBody =
  "Click the number of cases to add case numbers for the last several days or weeks.";

const tooltipTitle = (latestRt: number | null | undefined): string => {
  if (!isValidRt(latestRt)) {
    return needsDataTitle;
  } else if (latestRt === 0) {
    return zeroRtDataTitle;
  } else {
    return hasDataTitle(latestRt);
  }
};

const tooltipBody = (latestRt: number | null | undefined): string => {
  if (!isValidRt(latestRt)) {
    return needsDataBody;
  } else if (latestRt === 0) {
    return "";
  } else {
    return hasDataBody;
  }
};

const FacilityRowRtValuePill: React.FC<Props> = ({ latestRt: latestRt }) => {
  return (
    <>
      <RtValuePill spreadType={rtSpreadType(latestRt)}>
        <PillTooltip>
          <ChartTooltip>
            <TooltipContents>
              <TooltipValue>{tooltipTitle(latestRt)}</TooltipValue>
              <TooltipLabel>{tooltipBody(latestRt)}</TooltipLabel>
            </TooltipContents>
          </ChartTooltip>
        </PillTooltip>
        <PillCircle>{rtDisplayValue(latestRt)}</PillCircle>
      </RtValuePill>
    </>
  );
};

export default FacilityRowRtValuePill;
