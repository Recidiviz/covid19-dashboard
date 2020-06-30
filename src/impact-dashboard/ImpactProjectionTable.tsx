import numeral from "numeral";
import React from "react";
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
  color: ${Colors.forest};
  font-family: "Helvetica Neue", sans serif;
  font-size: 12px;
  font-weight: normal;
  letter-spacing: 0;
  text-align: center;
  width: 100%;
`;

const TableHeading = styled.thead`
  border-bottom: 1px solid rgba(70, 116, 114, 0.2);
  border-top: 1px solid rgba(70, 116, 114, 0.2);
`;

const HeadingCell = styled.th<{ left?: boolean }>`
  color: ${Colors.darkForest};
  font-family: "Poppins", sans serif;
  font-size: 10px;
  font-weight: normal;
  letter-spacing: 0.15em;
  line-height: 150%;
  padding-bottom: 1.5em;
  text-align: ${(props) => (props.left ? "left" : "center")};
  text-transform: uppercase;
`;

const TableSection = styled.tbody`
  &::before {
    content: "";
    display: table-row;
    height: 16px;
  }
`;

const TableHeadingCell = styled.td<{ left?: boolean }>`
  font-family: "Poppins", sans serif;
  font-size: 9px;
  font-weight: 600;
  line-height: 16px;
  opacity: 0.7;
  padding: 5px 0;
  text-align: ${(props) => (props.left ? "left" : "center")};
`;

const TableCell = styled.td<{
  italic?: boolean;
  center?: boolean;
  snapshot?: boolean;
}>`
  font-size: 13px;
  font-style: ${(props) => (props.italic ? "italic" : "inherit")};
  line-height: 150%;
  text-align: ${(props) => (props.center ? "center" : "left")};
  opacity: 0.7;
  padding-bottom: 0.5em;
  width: ${(props) => (props.snapshot ? "200px" : "auto")};
`;

const naString = "N/A";
function formatThousands(value: number | null): string {
  return value === null ? naString : numeral(value).format("0,0");
}

export function formatPct(value: number | null): string {
  return value === null ? naString : numeral(value).format("0,0.0%");
}

export function makeTableRow({
  row,
  formatter = formatThousands,
  snapshot = false,
}: {
  row: TableRow;
  formatter?: (value: number | null) => string;
  snapshot?: boolean;
}) {
  const { label, week1, week2, week3, overall } = row;
  return (
    <tr key={label}>
      <TableCell snapshot={snapshot}>{label}</TableCell>
      <TableCell center={!snapshot}>{formatter(week1)}</TableCell>
      <TableCell center={!snapshot}>{formatter(week2)}</TableCell>
      <TableCell center={!snapshot}>{formatter(week3)}</TableCell>
      <TableCell center={!snapshot}>{formatter(overall)}</TableCell>
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
          <TableHeadingCell left>Impacted projections</TableHeadingCell>
          <TableHeadingCell>in 1 wk</TableHeadingCell>
          <TableHeadingCell>in 2 wk</TableHeadingCell>
          <TableHeadingCell>in 3 wk</TableHeadingCell>
          <TableHeadingCell>Overall</TableHeadingCell>
        </tr>
      </TableHeading>
      <TableSection>
        <tr>
          <HeadingCell left scope="rowgroup">
            Total Incarcerated Population
          </HeadingCell>
        </tr>
        {incarceratedData.map((row, i) => {
          const formatter = i === 2 ? formatPct : undefined;
          return makeTableRow({ row, formatter });
        })}
      </TableSection>
      <TableSection>
        <tr>
          <HeadingCell left scope="rowgroup">
            Total In-facility Staff
          </HeadingCell>
        </tr>
        {staffData.map((row) => makeTableRow({ row }))}
      </TableSection>
      {peakData && (
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
      )}
    </Table>
  );
};

export default ImpactProjectionTable;
