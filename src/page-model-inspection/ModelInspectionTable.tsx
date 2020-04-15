import classNames from "classnames";
import { range } from "d3-array";
import flatten from "lodash/flatten";
import ndarray from "ndarray";
import numeral from "numeral";
import { GridCellProps, MultiGrid } from "react-virtualized";
import AutoSizer from "react-virtualized-auto-sizer";
import styled from "styled-components";

import { ageGroupIndex, seirIndex } from "../infection-model/seir";

interface Props {
  data: ndarray;
}

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

const ModelInspectionTable: React.FC<Props> = ({ data }) => {
  const columnWidths = new Array(data.shape[1]).fill(115);
  columnWidths.unshift(260);

  const rowHeights = new Array(1000).fill(50);

  const tableData = [
    // header row
    [
      // label cell
      "Days from today",
      // header cells
      ...range(data.shape[1]),
    ],
    // data rows
    ...flatten(
      range(data.shape[0]).map((compartment) =>
        range(data.shape[2]).map((bracket) => [
          // label cell
          `${seirIndex[compartment]} ${ageGroupIndex[bracket]}`,
          // data cells
          ...range(data.shape[1]).map((day) =>
            numeral(data.get(compartment, day, bracket)).format("0,0.000"),
          ),
        ]),
      ),
    ),
  ];

  const Cell = ({ style, rowIndex, columnIndex, key }: GridCellProps) => (
    <StyledCell
      key={key}
      style={style}
      className={classNames({
        "label": columnIndex === 0,
        "header": rowIndex === 0,
        "shade": rowIndex % 2,
        "section-start": rowIndex % ageGroupIndex.__length === 1,
      })}
    >
      {tableData[rowIndex][columnIndex]}
    </StyledCell>
  );

  return (
    <AutoSizer>
      {({ width }) => (
        <Wrapper>
          <MultiGrid
            cellRenderer={Cell}
            columnCount={data.shape[1] + 1}
            columnWidth={({ index }) => columnWidths[index]}
            fixedColumnCount={1}
            fixedRowCount={1}
            height={800}
            itemData={tableData}
            rowCount={data.shape[0] * data.shape[2]}
            rowHeight={({ index }) => rowHeights[index]}
            width={width - padding * 2}
          />
        </Wrapper>
      )}
    </AutoSizer>
  );
};

export default ModelInspectionTable;
