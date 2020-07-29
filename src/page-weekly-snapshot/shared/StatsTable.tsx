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
} from ".";

interface StatesTableProps {
  tableHeading: string;
  tableData: any;
  columnMarginRight: string;
}

const StatsTable: React.FC<StatesTableProps> = ({ tableHeading, tableData, columnMarginRight = "0px" }) => {
  return (
    <>
      <HorizontalRule />
      <Table>
        <thead>
          <tr>
            <TableHeading>
              <TextContainer>
                <SectionHeader>{tableHeading}</SectionHeader>
              </TextContainer>
            </TableHeading>
          </tr>
        </thead>
        <tbody>
          <tr>
            {
              tableData.map((columnData: any) => (
                <TableCell>
                  <TableCellContainer marginRight={columnMarginRight}>
                    <BorderDiv />
                    <Header>{columnData.header}</Header>
                    <HorizontalRule />
                    <TextContainer>
                      <Value>{columnData.value}</Value>
                      {columnData.valueDescription}
                    </TextContainer>
                  </TableCellContainer>
                </TableCell>
              ))
            }
          </tr>
        </tbody>
      </Table>
      <HorizontalRule />
    </>
  )
}

export default StatsTable;
