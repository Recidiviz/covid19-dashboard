import React from "react";
import {
  HorizontalRule,
  Table,
  TableHeading,
  TableCell,
  TableCellContainer,
  BorderDiv,
  Header,
  Value,
  TextContainer,
  SectionHeader,
  SectionSubheader,
} from ".";

type ColumnData = {
  header: string;
  value: string;
  valueDescription?: () => React.ReactElement | undefined
}

interface StatsTableRowProps {
  columns: ColumnData[];
  columnMarginRight?: string;
}

export const StatsTableRow: React.FC<StatsTableRowProps> = ({
  columns,
  columnMarginRight = "0px"
}) => {
  return (
    <tr>
      {
        columns.map((columnData: ColumnData) => (
          <TableCell>
            <TableCellContainer marginRight={columnMarginRight}>
              <BorderDiv />
              <Header>{columnData.header}</Header>
              <HorizontalRule />
              <TextContainer>
                <Value>{columnData.value}</Value>
                {columnData.valueDescription && columnData.valueDescription()}
              </TextContainer>
            </TableCellContainer>
          </TableCell>
        ))
      }
    </tr>
  )
}

interface StatesTableProps {
  tableHeading: string;
  tableSubheading?: string;
  children: React.ReactNode;
}

const StatsTable: React.FC<StatesTableProps> = ({
  tableHeading,
  tableSubheading,
  children,
}) => {
  return (
    <>
      <HorizontalRule />
      <Table>
        <thead>
          <tr>
            <TableHeading>
              <TextContainer>
                <SectionHeader>{tableHeading}</SectionHeader>
                {tableSubheading && <SectionSubheader>{tableSubheading}</SectionSubheader>}
              </TextContainer>
            </TableHeading>
          </tr>
        </thead>
        <tbody>
          {children}
        </tbody>
      </Table>
      <HorizontalRule />
    </>
  )
}

export default StatsTable;
