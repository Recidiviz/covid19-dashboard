import styled from "styled-components";

import { RateOfSpreadType } from "../constants/EpidemicModel";
import Colors, { lighten } from "./Colors";
import FontSizes from "./FontSizes";

const pillDimensions = "24px";

const textColor: { [x: string]: string } = {
  [RateOfSpreadType.CONTROLLED]: Colors.green,
  [RateOfSpreadType.INFECTIOUS]: Colors.darkRed,
  [RateOfSpreadType.MISSING]: Colors.darkRed,
};

const borderColor: { [x: string]: string } = {
  [RateOfSpreadType.CONTROLLED]: Colors.teal,
  [RateOfSpreadType.INFECTIOUS]: Colors.orange,
  [RateOfSpreadType.MISSING]: lighten(Colors.teal, 30),
};

const PillCircle = styled.div<{ circleType: string }>`
  min-width: ${pillDimensions};
  height: ${pillDimensions};
  background: ${Colors.slate};
  border: 1px solid
    ${(props) =>
      !!props.circleType
        ? borderColor[props.circleType]
        : borderColor.controlled};
  border-radius: ${pillDimensions};
  box-sizing: border-box;
  position: absolute;
  right: 0px;
  top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) =>
    !!props.circleType ? textColor[props.circleType] : textColor.controlled};
  font-family: Poppins;
  font-style: normal;
  font-weight: 600;
  font-size: ${FontSizes.Charts.pillText}px;
  z-index: 10;
  padding-left: 3px;
  padding-right: 3px;
`;

export default PillCircle;
