import styled from "styled-components";

import Colors from "./Colors";

const triangleSize = 7;

const ChartTooltip = styled.div`
  background: ${Colors.forest};
  border-radius: 4px;
  color: #fff;
  font-family: "Rubik", sans-serif;
  min-width: 60px;
  padding: 12px;
  position: relative;
  transform: translateX(-50%) translateY(-115%);
  z-index: 100;

  &::after {
    border-left: ${triangleSize}px solid transparent;
    border-right: ${triangleSize}px solid transparent;
    border-top: ${triangleSize}px solid ${Colors.forest};
    bottom: -${triangleSize}px;
    content: "";
    display: block;
    height: 0;
    left: calc(50% - ${triangleSize}px);
    position: absolute;
    width: 0;
  }
`;

export default ChartTooltip;
