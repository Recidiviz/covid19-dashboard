import numeral from "numeral";
import styled from "styled-components";

import Colors from "../design-system/Colors";

export interface TableRow {
  label: string;
  week1: number | null;
  week2: number | null;
  week3: number | null;
  overall: number | null; // n/a for some rows
}

interface Props {
  incarceratedData: TableRow[];
  peakData: TableRow[];
  staffData: TableRow[];
}

const Table = styled.table`
  color: ${Colors.black};
  font-family: "Rubik", sans-serif;
  font-size: 12px;
  font-weight: normal;
  letter-spacing: 0;
  text-align: center;
  width: 100%;

  th,
  td {
    padding-bottom: 5px;
  }
`;

const TableHeading = styled.thead`
  border-bottom: 1px solid ${Colors.forest};
`;

const HeadingCell = styled.th<{ left?: boolean }>`
  color: ${Colors.forest};
  font-family: "Poppins", sans-serif;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.05em;
  text-align: ${(props) => (props.left ? "left" : "center")};

  &.marked {
    position: relative;
    &::after {
      content: "";
      position: absolute;
      left: calc(50% - 0.5px);
      bottom: -4px;
      width: 0;
      height: 9px;
      border-color: ${Colors.forest};
      border-left: 1px solid;
      overflow: visible;
    }
  }
`;

const TableSection = styled.tbody`
  &::before {
    content: "";
    display: table-row;
    height: 16px;
  }
`;

const LabelCell = styled.td<{ italic?: boolean }>`
  color: ${Colors.forest};
  font-weight: normal;
  font-family: "Helvetica Neue";
  font-size: 13px;
  font-style: ${(props) => (props.italic ? "italic" : "inherit")};
  line-height: 150%;
  text-align: left;
  opacity: 0.7;
`;

const TableCell = styled.td<{ italic?: boolean; center?: boolean }>`
  color: ${Colors.forest};
  font-weight: normal;
  font-family: "Helvetica Neue";
  font-size: 13px;
  font-style: ${(props) => (props.italic ? "italic" : "inherit")};
  line-height: 150%;
  text-align: ${(props) => (props.center ? "center" : "left")};
  opacity: 0.7;
`;

const naString = "N/A";
function formatThousands(value: number | null): string {
  return value === null ? naString : numeral(value).format("0,0");
}

function formatPct(value: number | null): string {
  return value === null ? naString : numeral(value).format("0,0.0%");
}

function makeTableRow(row: TableRow, formatter = formatThousands) {
  const { label, week1, week2, week3, overall } = row;
  return (
    <tr key={label}>
      <TableCell>{label}</TableCell>
      <TableCell center>{formatter(week1)}</TableCell>
      <TableCell center>{formatter(week2)}</TableCell>
      <TableCell center>{formatter(week3)}</TableCell>
      <TableCell center>{formatter(overall)}</TableCell>
    </tr>
  );
}

function makeOverallOnlyRow(row: TableRow, formatter = formatThousands) {
  const { label, overall } = row;
  return (
    <tr key={label}>
      <TableCell colSpan={4}>{label}</TableCell>
      <TableCell center>{formatter(overall)}</TableCell>
    </tr>
  );
}

const ImpactProjectionTable: React.FC<Props> = ({
  incarceratedData,
  peakData,
  staffData,
}) => {
  return (
    <Table>
      <TableHeading>
        <tr>
          <LabelCell italic>Impact projections</LabelCell>
          <HeadingCell className="marked">in 1 wk</HeadingCell>
          <HeadingCell className="marked">in 2 wk</HeadingCell>
          <HeadingCell className="marked">in 3 wk</HeadingCell>
          <HeadingCell>Overall</HeadingCell>
        </tr>
      </TableHeading>
      <TableSection>
        <tr>
          <HeadingCell left scope="rowgroup">
            Incarcerated population (totals)
          </HeadingCell>
        </tr>
        {incarceratedData.map((row, i) => {
          const formatter = i === 2 ? formatPct : undefined;
          return makeTableRow(row, formatter);
        })}
      </TableSection>
      <TableSection>
        <tr>
          <HeadingCell left scope="rowgroup">
            In-facility staff (totals)
          </HeadingCell>
        </tr>
        {staffData.map((row) => makeTableRow(row))}
      </TableSection>
      <TableSection>
        <tr>
          <HeadingCell left scope="rowgroup">
            Maximum utilization
          </HeadingCell>
        </tr>
        {peakData.map((row, i) => {
          const formatter = i === 0 ? formatPct : undefined;
          return makeOverallOnlyRow(row, formatter);
        })}
      </TableSection>
    </Table>
  );
};

export default ImpactProjectionTable;
