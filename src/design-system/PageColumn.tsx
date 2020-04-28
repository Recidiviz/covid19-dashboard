import styled from "styled-components";

export const PageContainer = styled.div`
  display: flex;
  flex-direction: row;
`;
export const Column = styled.div<{ width?: string }>`
  margin: 20px;
  width: ${(props) => props.width || "50%"};
`;
