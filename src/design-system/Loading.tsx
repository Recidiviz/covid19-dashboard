import React from "react";
import BounceLoader from "react-spinners/BounceLoader";
import styled from "styled-components";

import Colors from "./Colors";

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const Loading: React.FC = () => {
  return (
    <LoadingContainer>
      <BounceLoader size={60} color={Colors.forest} />
    </LoadingContainer>
  );
};

export default Loading;
