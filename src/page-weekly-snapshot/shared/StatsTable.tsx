import { get } from "lodash";
import React from "react";
import styled from "styled-components";

import { formatThousands } from "../../impact-dashboard/ImpactProjectionTable";
import {
  BorderDiv,
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

const HeaderContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
`;

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
          <TableCellContainer marginRight={columnMarginRight}>
            <BorderDiv />
            <HeaderContainer>
              <Header>{columnData.header}</Header>
              {columnData.subheader && (
                <SubHeader>{columnData.subheader}</SubHeader>
              )}
            </HeaderContainer>
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
  header: string;
  children: React.ReactNode;
}

const StatsTable: React.FC<StatesTableProps> = ({ header, children }) => {
  return (
    <>
      <HorizontalRule />
      <Table>
        <thead>
          <tr>
            <TableHeading>
              <TextContainer>
                <SectionHeader>{header}</SectionHeader>
              </TextContainer>
            </TableHeading>
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </Table>
    </>
  );
};

export default StatsTable;
