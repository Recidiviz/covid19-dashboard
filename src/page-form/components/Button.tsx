import React from "react";
import styled from "styled-components";

const StyledButton = styled.button`
  background: #00615c;
  font-size: 16px;
  border-radius: 12px;
  color: white;
  font-family: "Poppins", sans-serif;
  height: 48px;
  width: 200px;
  outline: none;
`;

interface Props {
  label?: string;
  onChange?: (e: React.ChangeEvent) => void;
}

const Button: React.FC<Props> = (props) => {
  return <StyledButton>{props.label}</StyledButton>;
};

export default Button;
