import styled from "styled-components";

export const PageContainer = styled.div`
  display: flex;
  flex-direction: row;

  @media (max-width: 700px) {
    flex-direction: column;
  }
`;
export const Column = styled.div<{ width?: string }>`
  margin: 20px;
  width: ${(props) => props.width || "50%"};

  @media (max-width: 700px) {
    width: 95%;
  }
`;
