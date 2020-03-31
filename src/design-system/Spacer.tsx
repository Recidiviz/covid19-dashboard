import styled from "styled-components";

interface Props {
  x?: number;
  y?: number;
}

export const Spacer = styled.div<Props>`
  width: ${(props) => (props.x == null ? 0 : props.x)};
  height: ${(props) => (props.y == null ? 0 : props.y)};
`;
