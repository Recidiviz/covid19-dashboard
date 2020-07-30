import styled from "styled-components";

import Colors from "./Colors";

export const PageContainer = styled.div<{ marginTop?: string }>`
  display: flex;
  flex-direction: row;
  margintop: ${(props) => props.marginTop || "0px"};

  @media (max-width: 700px) {
    flex-direction: column;
  }

  @media print {
    flex-flow: row nowrap;
  }
`;

const borderStyle = `1px solid ${Colors.paleGreen}`;

export const Column = styled.div<{ width?: string; borderTop?: boolean }>`
  margin: 0 20px 20px;
  width: ${(props) => props.width || "50%"};
  border-top: ${(props) => (props.borderTop ? borderStyle : "none")};

  @media (max-width: 700px) {
    width: inherit;
  }

  @media print {
    width: 50%;
  }
`;
