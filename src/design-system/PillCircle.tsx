import styled from "styled-components";

import Colors from "./Colors";
import FontSizes from "./FontSizes";

const pillDimensions = "24px";

const PillCircle = styled.div`
  min-width: ${pillDimensions};
  height: ${pillDimensions};
  background: ${Colors.slate};
  border-width: 1px;
  border-style: solid;
  border-color: ${Colors.teal};
  border-radius: ${pillDimensions};
  box-sizing: border-box;
  position: absolute;
  right: 0px;
  top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Poppins;
  font-style: normal;
  font-weight: 600;
  font-size: ${FontSizes.Charts.pillText}px;
  z-index: 10;
  padding-left: 3px;
  padding-right: 3px;
`;

export default PillCircle;
