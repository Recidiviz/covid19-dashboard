import React from "react";
import styled from "styled-components";

const ImpactMetricsContainerDiv = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const ImpactMetricsContainer: React.FC = ({ children }) => {
  return <ImpactMetricsContainerDiv>{children}</ImpactMetricsContainerDiv>;
};

export default ImpactMetricsContainer;
