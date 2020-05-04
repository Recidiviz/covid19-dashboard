import styled from "styled-components";

import Colors from "./Colors";

interface TextLabelProps {
  softened?: boolean;
  padding?: boolean;
}

const TextLabel = styled.span<TextLabelProps>((props: TextLabelProps) => {
  return `
  ${props.softened ? null : "text-transform: uppercase;"}
  font-size: 10px;
  font-weight: 400;
  font-family: "Poppins", sans-serif;
  ${props.softened ? null : "letter-spacing: 2px;"}
  color: ${Colors.darkForest};
  ${props.padding ? "padding-right: 5px;" : null}
`;
});

TextLabel.defaultProps = {
  padding: true,
};

export default TextLabel;
