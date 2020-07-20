import { maxBy, minBy, orderBy } from "lodash";
import numeral from "numeral";
import React, { useEffect, useState } from "react";

import { DateMMMMdyyyy } from "../design-system/DateFormats";
import InputSelect from "../design-system/InputSelect";
import Loading from "../design-system/Loading";
import { Column, PageContainer } from "../design-system/PageColumn";
import { useFacilities } from "../facilities-context";
import {
  LocaleDataProvider,
  LocaleRecord,
  useLocaleDataState,
} from "../locale-data-context";
import LocaleStatsTable from "./LocaleStatsTable";
import {
  NYTCountyRecord,
  NYTData,
  NYTStateRecord,
  useNYTData,
} from "./NYTDataProvider";
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
import { UPDATE_STATE_NAME, useWeeklyReport } from "./weekly-report-context";

const stateNamesFilter = (key: string) =>
  !["US Total", "US Federal Prisons"].includes(key);
const formatNumber = (number: number) => numeral(number).format("0,0");

type PerCapitaCountyCase = {
  name: string;
  casesIncreasePerCapita: number | undefined;
};

function getDay(nytData: NYTCountyRecord[] | NYTStateRecord[], day: number) {
  if (day === 1) {
    return minBy(nytData, (d: NYTCountyRecord | NYTStateRecord) => d.date);
  } else {
    return maxBy(nytData, (d: NYTCountyRecord | NYTStateRecord) => d.date);
  }
}

function getCountyDataByName(counties: NYTCountyRecord[]) {
  const dataByCounty: { [countyName: string]: NYTCountyRecord[] } = {};

  counties.forEach((data: NYTCountyRecord) => {
    if (dataByCounty[data.county]) {
      dataByCounty[data.county] = [...dataByCounty[data.county], data];
    } else {
      dataByCounty[data.county] = [data];
    }
  });

  return dataByCounty;
}

function calculatePerCapitaIncrease(
  daySevenCases: number | undefined,
  dayOneCases: number | undefined,
  countyPopulation: number | undefined,
) {
  if (
    (!daySevenCases && daySevenCases !== 0) ||
    (!dayOneCases && dayOneCases !== 0) ||
    !countyPopulation
  )
    return;
  return (daySevenCases - dayOneCases) / countyPopulation;
}

function getCountyIncreasePerCapita(
  counties: NYTCountyRecord[],
  stateLocaleData: Map<string, LocaleRecord> | undefined,
) {
  const dataByCounty = getCountyDataByName(counties);
  const countyCasesIncreasePerCapita: PerCapitaCountyCase[] = [];

  for (const countyName in dataByCounty) {
    const dayOne = getDay(dataByCounty[countyName], 1);
    const daySeven = getDay(dataByCounty[countyName], 7);
    const countyPopulation = stateLocaleData?.get(countyName)?.totalPopulation;
    countyCasesIncreasePerCapita.push({
      name: countyName,
      casesIncreasePerCapita: calculatePerCapitaIncrease(
        daySeven?.cases,
        dayOne?.cases,
        countyPopulation,
      ),
    });
  }
  return countyCasesIncreasePerCapita;
}

function makeCountyRow(caseIncreasePerCapita: PerCapitaCountyCase) {
  let num = numeral(caseIncreasePerCapita.casesIncreasePerCapita).format(
    "0.000%",
  );
  let direction = "+";
  if (
    caseIncreasePerCapita?.casesIncreasePerCapita &&
    caseIncreasePerCapita?.casesIncreasePerCapita < 0
  ) {
    direction = "-";
  }
  return (
    <tr>
      <TextContainerHeading>
        <Left>{caseIncreasePerCapita.name} </Left>
        <Right>
          {direction} {num}
        </Right>
      </TextContainerHeading>
      <HorizontalRule />
    </tr>
  );
}

const LocaleSummaryTable: React.FC<{}> = () => {
  const { data: localeDataSource } = useLocaleDataState();
  const { state: facilitiesState } = useFacilities();
  const {
    state: { stateName, loading: scenarioLoading },
  } = useWeeklyReport();

  const { data, loading: nytLoading } = useNYTData();
  const { data: localeData, loading } = useLocaleDataState();

  if (!stateName) return null;

  // const stateNames = Array.from(localeData.keys()).filter(stateNamesFilter);

  const stateData = data[stateName];
  const dayOne = getDay(stateData.state || [], 1);
  const daySeven = getDay(stateData.state || [], 7);
  let sevenDayDiffInCases = 0;
  let perCapitaCountyCases: PerCapitaCountyCase[] = [];
  let highestFourCounties: PerCapitaCountyCase[] = [];

  if (dayOne?.stateName && daySeven?.stateName) {
    const stateLocaleData = localeData?.get(dayOne.stateName);
    const totalLocaleData = stateLocaleData?.get("Total");
    sevenDayDiffInCases = daySeven.cases - dayOne.cases;
    const totalBeds =
      totalLocaleData && totalLocaleData.icuBeds + totalLocaleData.hospitalBeds;

    perCapitaCountyCases = getCountyIncreasePerCapita(
      stateData.counties,
      stateLocaleData,
    );
    highestFourCounties = orderBy(
      perCapitaCountyCases.filter((c) => !!c.casesIncreasePerCapita),
      ["casesIncreasePerCapita"],
      ["desc"],
    ).slice(0, 4);
  }

  const facilities = Object.values(facilitiesState.facilities);
  const modelVersions = facilities.map((f) => f.modelVersions);

  if (!scenarioLoading && !facilitiesState.loading && !facilities.length) {
    return <div>Missing scenario data for state: {stateName}</div>;
  }

  console.log(stateData);

  return (
    <>
      <Heading>Locale Summary</Heading>
      <PageContainer>
        <BorderDiv marginRight={"-20px"} />
        <Column>
          <Table>
            <BorderDiv />
          </Table>
        </Column>
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
          {highestFourCounties.map((row) => makeCountyRow(row))}
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
        </Column>
      </PageContainer>
    </>
  );
};

export default LocaleSummaryTable;
