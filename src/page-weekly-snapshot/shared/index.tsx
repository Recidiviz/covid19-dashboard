import styled from "styled-components";

import Colors from "../../design-system/Colors";

export const Table = styled.table`
  color: ${Colors.black};
  text-align: left;
  width: 100%;
  margin-top: 10px;
  table-layout: fixed;
`;

export const HorizontalRule = styled.hr`
  border-color: ${Colors.opacityGray};
  width: 100%;
  margin-bottom: 10px;
`;

export const TableHeadingCell = styled.td`
  font-family: "Libre Franklin";
  font-weight: bold;
  font-size: 11px;
  line-height: 13px;
  vertical-align: middle;
`;

export const LeftHeading = styled.div`
  text-align: left;
`;

export const TextContainerHeading = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`;

export const TextContainer = styled.div`
  width: 100%;
  margin: 15px 0 15px;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  color: ${Colors.black};
`;

export const Right = styled.div`
  text-align: right;
`;

export const Left = styled.div`
  text-align: left;
  font-size: 24px;
  font-family: "Libre Baskerville";
`;

export const BorderDiv = styled.div`
  border-top: 2px solid ${Colors.black};
`;

export const TableCell = styled.td<{ label?: boolean }>`
  font-size: 11px;
  line-height: 200%;
  text-align: "left";
  width: ${(props) => (props.label ? "200px" : "auto")};
`;
