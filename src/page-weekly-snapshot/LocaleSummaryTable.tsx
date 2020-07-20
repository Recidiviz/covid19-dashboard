import React from "react";

import { Column, PageContainer } from "../design-system/PageColumn";
import { useFacilities } from "../facilities-context";
import { useLocaleDataState } from "../locale-data-context";
import {
  BorderDiv,
  COLUMN_SPACING,
  DeltaColor,
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
      <PageContainer>
        <BorderDiv />
        <Column />
        <Column>
          <Table>
            <tr>
              <TableHeading>
                <BorderDiv marginRight={COLUMN_SPACING} />
                <TextContainerHeading>
                  State rate of spread
                </TextContainerHeading>
                <HorizontalRule marginRight={COLUMN_SPACING} />
              </TableHeading>
              <TableHeading>
                <BorderDiv marginRight={COLUMN_SPACING} />
                <TextContainerHeading>
                  Facilities with rate of spread > 1
                </TextContainerHeading>
                <HorizontalRule marginRight={COLUMN_SPACING} />
              </TableHeading>
            </tr>
            <td>
              <TextContainer>
                <DeltaColor delta={1.2}>
                  <Left>1.20 </Left>
                </DeltaColor>
                <Right marginRight={COLUMN_SPACING}>
                  +0.20 since last week
                </Right>
              </TextContainer>
            </td>
            <td>
              <TextContainer>
                <Left>3 of 14 </Left>
                <Right marginRight={COLUMN_SPACING}>-2 since last week</Right>
              </TextContainer>
            </td>
          </Table>
          <br />
          <tr>
            <TableHeading>
              <BorderDiv>
                <TextContainerHeading>
                  <LeftHeading>Counties to watch</LeftHeading>
                  <Right>Change in cases per 100k since last week</Right>
                </TextContainerHeading>
              </BorderDiv>
              <HorizontalRule />
            </TableHeading>
          </tr>
          <tr>
            <TextContainerHeading>
              <Left>hello123</Left>
              <Right>+ 20%</Right>
            </TextContainerHeading>
            <HorizontalRule />
          </tr>
          <tr>
            <TextContainerHeading>
              <Left>hello12345</Left>
              <Right>+ 18%</Right>
            </TextContainerHeading>
            <HorizontalRule />
          </tr>

          <br />
          <tr>
            <TableHeading>
              <BorderDiv>
                <TextContainerHeading>
                  <LeftHeading>Facilities in counties to watch</LeftHeading>
                </TextContainerHeading>
              </BorderDiv>
              <HorizontalRule />
            </TableHeading>
          </tr>
          <tr>
            <TextContainerHeading>
              <Left>FMC Rochester </Left>
            </TextContainerHeading>
            <HorizontalRule />
          </tr>
        </Column>
      </PageContainer>
    </>
  );
};

export default LocaleSummaryTable;
