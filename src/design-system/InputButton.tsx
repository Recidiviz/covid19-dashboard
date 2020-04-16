import React from "react";
import styled, { InterpolationFunction } from "styled-components";

interface StyleProps {
  styles: React.CSSProperties;
}

const StyledButton = styled.button<StyleProps>`
  background: #00615c;
  font-size: 16px;
  border-radius: 12px;
  color: white;
  font-family: "Poppins", sans-serif;
  height: 48px;
  width: 200px;
  outline: none;
  ${(props: StyleProps) => props.styles as InterpolationFunction<StyleProps>};
`;

interface Props {
  label?: string;
  styles?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
}

const InputButton: React.FC<Props> = (props) => {
  return (
    <StyledButton styles={props.styles || {}} onClick={props.onClick}>
      {props.label}
    </StyledButton>
  );
};

export default InputButton;
