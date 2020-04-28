import styled from "styled-components";

import Colors from "./Colors";

const TextLabel = styled.span<{ softened?: boolean }>`
  ${(props) => (props.softened ? null : "text-transform: uppercase;")}
  font-size: 10px;
  font-weight: 400;
  font-family: "Poppins", sans-serif;
  ${(props) => (props.softened ? null : "letter-spacing: 2px;")}
  color: ${Colors.darkForest};
  padding-right: 5px;
`;

export default TextLabel;
