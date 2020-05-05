import React from "react";
import styled from "styled-components";

import { RateOfSpreadType } from "../constants/EpidemicModel";
import Colors from "../design-system/Colors";
import PillCircle from "../design-system/PillCircle";

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
`;

interface Props {
  latestRt: number | null;
}

const rtSpreadType = (latestRt: number | null) => {
  if (!latestRt) {
    return RateOfSpreadType.MISSING;
  } else if (latestRt > 1) {
    return RateOfSpreadType.INFECTIOUS;
  } else {
    return RateOfSpreadType.CONTROLLED;
  }
};

const displayRtValue = (latestRt: number | null) => {
  return !latestRt ? "?" : latestRt;
};

const FacilityRowRtValuePill: React.FC<Props> = ({ latestRt: latestRt }) => {
  return (
    <RtValuePill spreadType={rtSpreadType(latestRt)}>
      <PillCircle className="pill-circle">
        {displayRtValue(latestRt)}
      </PillCircle>
    </RtValuePill>
  );
};

export default FacilityRowRtValuePill;
