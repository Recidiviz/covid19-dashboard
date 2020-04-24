import classNames from "classnames";
import numeral from "numeral";
import React from "react";
import { GridCellProps, MultiGrid } from "react-virtualized";
import AutoSizer from "react-virtualized-auto-sizer";
import styled from "styled-components";

import { ageGroupIndex } from "../infection-model/seir";

const padding = 15;
const Wrapper = styled.div`
  width: 100%;
  padding: ${padding}px;
`;

const StyledCell = styled.div`
  align-items: center;
  display: flex;
  font-family: sans-serif;
  font-weight: normal;
  letter-spacing: 0;
  padding: 8px;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;

  &.label {
    font-weight: 600;
    position: sticky;
  }

  &.header {
    position: sticky;
    font-weight: 600;
  }

  &.shade {
    background-color: #c9c9c9;
  }

  &.section-start {
    border-top: 2px solid black;
  }
`;

interface Props {
  data: Array<Array<React.ReactText>>;
  summaryRows: number;
}

const ModelInspectionTable: React.FC<Props> = ({ data, summaryRows }) => {
  const columnWidths = new Array(data[0].length).fill(115);
  // label column is wider
  columnWidths[0] = 260;

  const Cell = ({ style, rowIndex, columnIndex, key }: GridCellProps) => {
    const cellValue = data[rowIndex][columnIndex];
    return (
      <StyledCell
        key={key}
        style={style}
        className={classNames({
          "label": columnIndex === 0,
          "header": rowIndex === 0,
          "shade": rowIndex % 2,
          "section-start":
            (rowIndex - summaryRows) % ageGroupIndex.__length === 1,
        })}
      >
        {typeof cellValue === "number"
          ? numeral(cellValue).format("0,0")
          : cellValue}
      </StyledCell>
    );
  };

  return (
    <AutoSizer>
      {({ width }) => (
        <Wrapper>
          <MultiGrid
            cellRenderer={Cell}
            columnCount={data[0].length}
            columnWidth={({ index }) => columnWidths[index]}
            fixedColumnCount={1}
            fixedRowCount={1}
            height={800}
            rowCount={data.length}
            rowHeight={50}
            width={width - padding * 2}
          />
        </Wrapper>
      )}
    </AutoSizer>
  );
};

export default ModelInspectionTable;
