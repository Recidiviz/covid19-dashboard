import styled from "styled-components";

import Colors, { lighten } from "./Colors";
import FontSizes from "./FontSizes";

const pillDimensions = "24px";

const textColor: { [index: string]: string } = {
  normal: Colors.green,
  infectious: Colors.darkRed,
  neutral: Colors.darkRed,
};

const borderColor: { [index: string]: string } = {
  normal: Colors.teal,
  infectious: Colors.orange,
  neutral: lighten(Colors.teal, 30),
};

const PillCircle = styled.div<{ circleType: string }>`
  min-width: ${pillDimensions};
  height: ${pillDimensions};
  background: ${Colors.slate};
  border: 1px solid
    ${(props) =>
      !!props.circleType ? borderColor[props.circleType] : borderColor.normal};
  border-radius: ${pillDimensions};
  box-sizing: border-box;
  position: absolute;
  right: 0px;
  top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) =>
    !!props.circleType ? textColor[props.circleType] : textColor.normal};
  font-family: Poppins;
  font-style: normal;
  font-weight: 600;
  font-size: ${FontSizes.Charts.pillText}px;
  z-index: 10;
  padding-left: 3px;
  padding-right: 3px;
`;

export default PillCircle;
