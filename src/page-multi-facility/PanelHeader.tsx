import React from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";

const HeaderContainer = styled.div`
  border-color: ${Colors.opacityGray};
`;

const PanelHeader: React.FC = ({ children }) => {
  return (
    <HeaderContainer className="border-t border-b mb-5 py-2 flex flex-row">
      {children}
    </HeaderContainer>
  );
};

export default PanelHeader;

export const PanelHeaderText = styled.div`
  color: ${Colors.forest};
  opacity: 0.7;
  font-family: "Poppins", sans-serif;
  font-size: 9px;
  font-weight: 600;
  line-height: 16px;
`;
