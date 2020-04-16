import React, { useState } from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";

const PageOneContainer = styled.div`
  width: 100%;
  flex: 1 1
`;


const PageOne: React.FC = () => {
  return (
    <PageOneContainer>
      Content
    </PageOneContainer>
  );
};

export default PageOne;
