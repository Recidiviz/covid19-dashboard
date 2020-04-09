import styled from "styled-components";

export const FormGrid = styled.div`
  width: 100%;
`;

export const FormGridRow = styled.div<{ labelsOnly?: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  ${(props) => !props.labelsOnly && "margin-bottom: 24px;"}
`;

export const FormGridCell = styled.div<{ width?: number; vAlign?: string }>`
  box-sizing: border-box;
  padding: 0 8px;
  ${(props) => (props.width ? `width: ${props.width}%;` : null)}
  flex: ${(props) => (props.width ? "0 0" : "1 1")} auto;
  ${(props) => (props.vAlign ? `align-self: ${props.vAlign}` : null)}
`;
