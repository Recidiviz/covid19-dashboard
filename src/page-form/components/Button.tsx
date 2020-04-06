import React from "react";
import styled, { keyframes } from "styled-components";

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
  onClick?: (e: React.MouseEvent) => void;
  loading?: boolean;
}

const Button: React.FC<Props> = (props) => {
  return (
    <StyledButton onClick={props.onClick}>
      {props.loading ? <Loader /> : props.label}
    </StyledButton>
  );
};

export default Button;

const loadingAnimation = keyframes`
0% {
  transform: rotate(0deg);
}
100% {
  transform: rotate(360deg);
}
`;
const Spinner = styled.div`
  display: inline-block;
  position: relative;
  width: 24px;
  height: 24px;
`;

const Ring = styled.div`
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 24px;
  height: 24px;
  border: 2px solid #fff;
  border-radius: 50%;
  animation: ${loadingAnimation} 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: #fff transparent transparent transparent;
`;

const SubRing1 = styled.div`
  animation-delay: -0.45s;
`;

const SubRing2 = styled.div`
  animation-delay: -0.3s;
`;

const SubRing3 = styled.div`
  animation-delay: -0.15s;
`;

const Loader: React.FC = () => (
  <Spinner>
    <Ring />
    <SubRing1 />
    <SubRing2 />
    <SubRing3 />
  </Spinner>
);
