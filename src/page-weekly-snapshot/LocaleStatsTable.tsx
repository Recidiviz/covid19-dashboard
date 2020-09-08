import { maxBy, minBy, orderBy } from "lodash";
import numeral from "numeral";
import React from "react";
import styled from "styled-components";

import { Column, PageContainer } from "../design-system/PageColumn";
import { useFacilities } from "../facilities-context";
import {
  getFacilitiesRtDataById,
  isRtData,
  RtData,
  RtRecord,
} from "../infection-model/rt";
import { LocaleRecord, useLocaleDataState } from "../locale-data-context";
import { Facility } from "../page-multi-facility/types";
import {
  numFacilitiesWithRtGreaterThan1PrevWeek,
  numFacilitiesWithRtGreaterThan1ThisWeek,
} from "../page-response-impact/rtStatistics";
import { NYTCountyRecord, NYTStateRecord, useNYTData } from "./NYTDataProvider";
import {
  BorderDiv,
  CellHeaderContainer,
  COLUMN_SPACING,
  Header,
  Heading,
  HorizontalRule,
  Left,
  RankContainer,
  RankText,
  Right,
  SubHeader,
  Table,
  TableHeading,
  TextContainer,
  TextContainerHeading,
  Value,
  ValueDescription,
} from "./shared";
import StatsTable, { StatsTableRow } from "./shared/StatsTable";
import { useWeeklyReport } from "./weekly-report-context";

const LocaleStatsContainer = styled.div``;

type PerCapitaCountyCase = {
  name: string;
  casesIncreasePerCapita: number | undefined;
};

function getDirection(
  numFacilitiesLastWeek: number,
  numFacilitiesThisWeek: number,
) {
  return numFacilitiesLastWeek <= numFacilitiesThisWeek ? "+" : "-";
}

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

function getFacilitiesInCountiesToWatch(
  facilities: Facility[],
  countiesToWatch: string[],
) {
  const result: string[] = [];
  for (let i = 0; i < facilities.length; i++) {
    const modelInputs = facilities[i].modelInputs;
    const currCounty = modelInputs.countyName;
    if (currCounty && countiesToWatch.includes(currCounty)) {
      result.push(facilities[i].name);
    }
  }
  return result.join(", ");
}

function getFacilitiesCounties(facilities: Facility[]) {
  const facilitiesCounties = new Set(
    facilities.map((facility) => facility.modelInputs.countyName),
  );
  return facilitiesCounties;
}

function makeCountyRow(
  caseIncreasePerCapita: PerCapitaCountyCase,
  facilitiesCounties: Set<string | undefined>,
  index: number,
) {
  const num = numeral(caseIncreasePerCapita.casesIncreasePerCapita).format(
    "0.000%",
  );

  let direction = "+";
  if (caseIncreasePerCapita?.casesIncreasePerCapita) {
    direction = caseIncreasePerCapita?.casesIncreasePerCapita > 0 ? "+" : "-";
  }

  let name = caseIncreasePerCapita.name;
  if (facilitiesCounties.has(name)) {
    name += "***";
  }

  return (
    <tr>
      <TextContainerHeading>
        <RankContainer>
          <RankText>{index + 1}</RankText>
          <Left>{name}</Left>
        </RankContainer>
        <Right>
          {direction} {num}
        </Right>
      </TextContainerHeading>
      {index !== 3 && <HorizontalRule />}
    </tr>
  );
}

function makeFacilitiesToWatchRow(highestCountiesFacilities: string) {
  return (
    <tr>
      <TextContainer>
        <Value>{highestCountiesFacilities}</Value>
      </TextContainer>
    </tr>
  );
}

const LocaleStatsTable: React.FC<{}> = () => {
  const { state: facilitiesState } = useFacilities();
  const {
    state: { stateName, loading: scenarioLoading },
  } = useWeeklyReport();

  const facilities = Object.values(facilitiesState.facilities);
  const facilitiesCounties = getFacilitiesCounties(facilities);

  const rtData = getFacilitiesRtDataById(facilitiesState.rtData, facilities);
  const totalNumFacilities = facilities.length;
  let numFacilitiesLastWeek = 0;
  let numFacilitiesThisWeek = 0;

  if (rtData) {
    const rtDataValues = Object.values(rtData);
    const facilitiesRtRecords: RtRecord[][] = rtDataValues
      .filter(isRtData)
      .map((rtData: RtData) => rtData.Rt);
    numFacilitiesThisWeek = numFacilitiesWithRtGreaterThan1ThisWeek(
      facilitiesRtRecords,
    );
    numFacilitiesLastWeek = numFacilitiesWithRtGreaterThan1PrevWeek(
      facilitiesRtRecords,
    );
  }

  const { data } = useNYTData();
  const { data: localeData } = useLocaleDataState();

  if (!stateName) return null;

  const stateData = data[stateName];
  const dayOne = getDay(stateData.state || [], 1);
  const daySeven = getDay(stateData.state || [], 7);
  let perCapitaCountyCases: PerCapitaCountyCase[] = [];
  let highestFourCounties: PerCapitaCountyCase[] = [];
  let highestCountiesFacilities = "";

  if (dayOne?.stateName && daySeven?.stateName) {
    const stateLocaleData = localeData?.get(dayOne.stateName);

    perCapitaCountyCases = getCountyIncreasePerCapita(
      stateData.counties,
      stateLocaleData,
    );
    highestFourCounties = orderBy(
      perCapitaCountyCases.filter((c) => !!c.casesIncreasePerCapita),
      ["casesIncreasePerCapita"],
      ["desc"],
    ).slice(0, 4);

    const countiesToWatch = highestFourCounties.map((county) => {
      return county.name;
    });

    highestCountiesFacilities = getFacilitiesInCountiesToWatch(
      facilities,
      countiesToWatch,
    );
  }

  if (!scenarioLoading && !facilitiesState.loading && !facilities.length) {
    return <div>Missing scenario data for state: {stateName}</div>;
  }

  return (
    <LocaleStatsContainer>
      <HorizontalRule />
      <Heading>Locale Summary</Heading>
      <PageContainer>
        <Column margin={`0 ${COLUMN_SPACING} 0 0`}>
          <BorderDiv />
        </Column>
        <Column borderTop={false} margin={`0 0 0 ${COLUMN_SPACING}`}>
          <StatsTable>
            <StatsTableRow
              columnMarginRight={COLUMN_SPACING}
              columns={[
                {
                  header: "State rate of spread",
                  value: " ",
                  valueDescription: (
                    <ValueDescription>since last week</ValueDescription>
                  ),
                },
                {
                  header: "Facilities with rate of spread > 1.00",
                  value: `${numFacilitiesThisWeek} of ${totalNumFacilities}`,
                  marginRight: "0px",
                  valueDescription: (
                    <ValueDescription>
                      {getDirection(
                        numFacilitiesLastWeek,
                        numFacilitiesThisWeek,
                      )}
                      {numFacilitiesLastWeek} since last week
                    </ValueDescription>
                  ),
                },
              ]}
            />
          </StatsTable>
          <BorderDiv />
          <Table>
            <tbody>
              <tr>
                <CellHeaderContainer>
                  <Header>Counties to watch</Header>
                  <SubHeader>
                    Change in cases per 100k since last week
                  </SubHeader>
                </CellHeaderContainer>
                <HorizontalRule />
              </tr>
              {highestFourCounties.map((row, index) =>
                makeCountyRow(row, facilitiesCounties, index),
              )}
              <tr>
                <TableHeading>
                  <BorderDiv />
                  <Header>Facilities in counties to watch</Header>
                  <HorizontalRule />
                </TableHeading>
              </tr>
              {makeFacilitiesToWatchRow(highestCountiesFacilities)}
            </tbody>
          </Table>
        </Column>
      </PageContainer>
    </LocaleStatsContainer>
  );
};

export default LocaleStatsTable;
