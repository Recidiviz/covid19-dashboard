import React from "react";
import styled from "styled-components";

export const StyledButton = styled.button<Props>`
  background: ${(props) => props.styles?.background || "#00615c"};
  font-size: ${(props) => props.styles?.fontSize || "16px"};
  border-radius: ${(props) => props.styles?.borderRadius || "12px"};
  color: white;
  font-family: ${(props) =>
    props.styles?.fontFamily || "'Poppins', sans-serif"};
  height: 48px;
  width: ${(props) => props.styles?.width || "200px"};
  outline: none;
`;

interface Props {
  label?: string;
  styles?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
}

const InputButton: React.FC<Props> = (props) => {
  return (
    <StyledButton styles={props.styles} onClick={props.onClick}>
      {props.label}
    </StyledButton>
  );
};

export default InputButton;
