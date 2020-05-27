import styled from "styled-components";

import Colors from "./Colors";

export const PageContainer = styled.div`
  display: flex;
  flex-direction: row;

  @media (max-width: 700px) {
    flex-direction: column;
  }
`;

export const Column = styled.div<{ width?: string }>`
  margin: 0 20px 20px;
  width: ${(props) => props.width || "50%"};
  border-top: 1px solid ${Colors.paleGreen};

  @media (max-width: 700px) {
    width: inherit;
  }
`;
