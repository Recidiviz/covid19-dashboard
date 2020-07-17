import React from "react";

import { Column, PageContainer } from "../design-system/PageColumn";
import { useFacilities } from "../facilities-context";
import { useLocaleDataState } from "../locale-data-context";
import {
  BorderDiv,
  COLUMN_SPACING,
  Heading,
  HorizontalRule,
  Left,
  LeftHeading,
  Right,
  Table,
  TableCell,
  TableHeading,
  TableHeadingCell,
  TextContainer,
  TextContainerHeading,
} from "./shared";
import { useWeeklyReport } from "./weekly-report-context";

const LocaleSummaryTable: React.FC<{}> = ({}) => {
  const { data: localeDataSource } = useLocaleDataState();
  const { state: facilitiesState } = useFacilities();
  const {
    state: { stateName, loading: scenarioLoading },
  } = useWeeklyReport();

  if (!stateName) return null;

  const facilities = Object.values(facilitiesState.facilities);
  const modelVersions = facilities.map((f) => f.modelVersions);

  if (!scenarioLoading && !facilitiesState.loading && !facilities.length) {
    return <div>Missing scenario data for state: {stateName}</div>;
  }

  return (
    <>
      <Heading>Locale Summary</Heading>
      <BorderDiv />
      <PageContainer>
        <Column>wfjoiw</Column>
        <Column>
          <Table>
            <tr>
              <TableHeading>
                <BorderDiv marginRight={COLUMN_SPACING} />
                Incarcerated population
              </TableHeading>
              <TableHeading>
                <BorderDiv marginRight={COLUMN_SPACING} />
                Incarcerated cases
              </TableHeading>
            </tr>
            <BorderDiv />
          </Table>
        </Column>
      </PageContainer>
    </>
  );
};

export default LocaleSummaryTable;
