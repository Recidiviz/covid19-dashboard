import styled from "styled-components";

import Colors from "../../design-system/Colors";

export const COLUMN_SPACING = "20px";
export const TOP_BOTTOM_MARGIN = "10px";

export const DELTA_DIRECTION_MAPPING = {
  positive: "↑ ",
  negative: "↓ ",
  same: "↑ ",
};

export const Delta = styled.div<{ deltaDirection?: string }>`
  color: ${(props) =>
    props.deltaDirection == "positive"
      ? Colors.red
      : props.deltaDirection == "negative"
      ? Colors.green
      : Colors.gray};
`;

export const DeltaColor = styled.div<{ delta: number }>`
  color: ${(props) =>
    props.delta <= 0.9
      ? Colors.green
      : 0.9 < props.delta && props.delta <= 1.1
      ? Colors.yellow
      : 1.1 < props.delta && props.delta <= 1.4
      ? Colors.orange
      : Colors.red};
`;

export const TableHeading = styled.th`
  width 25%;
`;

export const Table = styled.table`
  color: ${Colors.black};
  text-align: left;
  width: 100%;
  margin-top: 10px;
  table-layout: fixed;
`;

export const HorizontalRule = styled.hr<{ marginRight?: string }>`
  border-color: ${Colors.opacityGray};
  margin-top: 10px;
  margin-right: ${(props) => props.marginRight || "0px"};
`;

export const TableHeadingCell = styled.td`
  font-family: "Libre Franklin";
  font-weight: bold;
  font-size: 11px;
  line-height: 13px;
  vertical-align: middle;
`;

export const LeftHeading = styled.div<{ marginTop?: string }>`
  margin-top: ${(props) => props.marginTop || "10px"};
  text-align: left;
`;

export const TextContainerHeading = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
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

export const Right = styled.div<{ marginRight?: string; marginTop?: string }>`
  text-align: right;
  margin-top: ${(props) => props.marginTop || "0px"};
  margin-right: ${(props) => props.marginRight || "0px"};
`;

export const Left = styled.div<{ marginRight?: string; color?: string }>`
  text-align: left;
  font-size: 24px;
  font-family: "Libre Baskerville";
  margin-right: ${(props) => props.marginRight || "0px"};
  color: ${(props) => props.color || "${Colors.black}"};
`;

export const BorderDiv = styled.div<{ marginRight?: string }>`
  border-top: 1px solid ${Colors.black};
  margin-right: ${(props) => props.marginRight || "5px"};
`;

export const TableCell = styled.td<{ label?: boolean }>`
  font-size: 11px;
  line-height: 200%;
  text-align: "left";
  width: ${(props) => (props.label ? "200px" : "auto")};
`;

export const Heading = styled.div`
  font-weight: 700;
  line-height: 13px;
  border-top: 1px solid ${Colors.darkGray};
  padding: 10px 0;
`;

export const DeltaContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;
