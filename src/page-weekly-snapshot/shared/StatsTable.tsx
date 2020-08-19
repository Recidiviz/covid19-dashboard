import { get } from "lodash";
import React from "react";

import { formatThousands } from "../../impact-dashboard/ImpactProjectionTable";
import {
  BorderDiv,
  CellHeaderContainer,
  COLUMN_SPACING,
  Delta,
  DELTA_DIRECTION_MAPPING,
  DeltaContainer,
  Header,
  HorizontalRule,
  SectionHeader,
  SubHeader,
  Table,
  TableCell,
  TableCellContainer,
  TableHeading,
  TextContainer,
  Value,
  ValueDescription,
} from ".";

export const ValueDescriptionWithDelta: React.FC<{
  deltaDirection: string;
  delta: number;
}> = ({ deltaDirection, delta }) => {
  return (
    <DeltaContainer>
      <Delta deltaDirection={deltaDirection}>
        {get(DELTA_DIRECTION_MAPPING, deltaDirection)}
      </Delta>
      <ValueDescription marginRight={COLUMN_SPACING}>
        {formatThousands(delta)}
      </ValueDescription>
    </DeltaContainer>
  );
};

type ColumnData = {
  header: string;
  subheader?: string;
  marginRight?: string;
  value: string;
  valueDescription?: React.ReactElement | undefined;
};

interface StatsTableRowProps {
  columns: ColumnData[];
  columnMarginRight?: string;
}

export const StatsTableRow: React.FC<StatsTableRowProps> = ({
  columns,
  columnMarginRight = "0px",
}) => {
  return (
    <tr>
      {columns.map((columnData: ColumnData, index) => (
        <TableCell key={`${columnData.header}-${index}`}>
          <TableCellContainer
            marginRight={columnData.marginRight || columnMarginRight}
          >
            <BorderDiv />
            <CellHeaderContainer>
              <Header>{columnData.header}</Header>
              {columnData.subheader && (
                <SubHeader>{columnData.subheader}</SubHeader>
              )}
            </CellHeaderContainer>
            <HorizontalRule />
            <TextContainer>
              <Value>{columnData.value}</Value>
              {columnData.valueDescription && columnData.valueDescription}
            </TextContainer>
          </TableCellContainer>
        </TableCell>
      ))}
    </tr>
  );
};

interface StatesTableProps {
  header?: string;
  children: React.ReactNode;
}

const StatsTable: React.FC<StatesTableProps> = ({ header, children }) => {
  return (
    <Table>
      {header && (
        <thead>
          <tr>
            <TableHeading>
              <TextContainer>
                <SectionHeader>{header}</SectionHeader>
              </TextContainer>
            </TableHeading>
          </tr>
        </thead>
      )}
      <tbody>{children}</tbody>
    </Table>
  );
};

export default StatsTable;
