import React from "react";
import styled from "styled-components";

export const StyledButton = styled.button<Props>`
  background: #00615c;
  font-size: 16px;
  border-radius: 12px;
  color: white;
  font-family: "Poppins", sans-serif;
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
