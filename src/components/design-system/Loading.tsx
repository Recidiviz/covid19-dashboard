import React from "react";
import BounceLoader from "react-spinners/BounceLoader";
import styled from "styled-components";

import Colors from "./Colors";

const LoadingContainer = styled.div<Props>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: ${(props) => props.styles?.minHeight};
  padding-bottom: ${(props) => props.styles?.paddingBottom};
`;

interface Props {
  styles?: React.CSSProperties;
}

const Loading: React.FC<Props> = (props) => {
  return (
    <LoadingContainer styles={props.styles}>
      <BounceLoader size={60} color={Colors.forest} />
    </LoadingContainer>
  );
};

export default Loading;
