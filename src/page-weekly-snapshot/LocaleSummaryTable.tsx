import { maxBy, minBy, orderBy, pick } from "lodash";
import numeral from "numeral";
import React from "react";

import { Column, PageContainer } from "../design-system/PageColumn";
import { useFacilities } from "../facilities-context";
import {
  getFacilitiesRtDataById,
  isRtData,
  RtData,
  RtRecord,
} from "../infection-model/rt";
import { LocaleRecord, useLocaleDataState } from "../locale-data-context";
import {
  numFacilitiesWithRtGreaterThan1PrevWeek,
  numFacilitiesWithRtGreaterThan1ThisWeek,
} from "../page-response-impact/rtStatistics";
import { NYTCountyRecord, NYTStateRecord, useNYTData } from "./NYTDataProvider";
import {
  BorderDiv,
  COLUMN_SPACING,
  Heading,
  HorizontalRule,
  Left,
  LeftHeading,
  Right,
  Table,
  TableHeading,
  TextContainer,
  TextContainerHeading,
  TOP_BOTTOM_MARGIN,
} from "./shared";
import { useWeeklyReport } from "./weekly-report-context";

type PerCapitaCountyCase = {
  name: string;
  casesIncreasePerCapita: number | undefined;
};

function getDirection(
  numFacilitiesLastWeek: number,
  numFacilitiesThisWeek: number,
) {
  if (numFacilitiesLastWeek <= numFacilitiesThisWeek) {
    return "+";
  }
  return "-";
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

function makeCountyRow(
  caseIncreasePerCapita: PerCapitaCountyCase,
  facilitiesCounties: (string | undefined)[],
) {
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
  let name = caseIncreasePerCapita.name;
  if (facilitiesCounties.includes(name)) {
    name += "***";
  }
  return (
    <tr>
      <TextContainerHeading>
        <Left marginTop={TOP_BOTTOM_MARGIN} marginBottom={TOP_BOTTOM_MARGIN}>
          {name}{" "}
        </Left>
        <Right>
          {direction} {num}
        </Right>
      </TextContainerHeading>
      <HorizontalRule />
    </tr>
  );
}

const LocaleSummaryTable: React.FC<{}> = () => {
  const { state: facilitiesState } = useFacilities();
  const {
    state: { stateName, loading: scenarioLoading },
  } = useWeeklyReport();

  const facilities = Object.values(facilitiesState.facilities);
  let facilitiesCounties: (string | undefined)[] = [];

  for (let i = 0; i < facilities.length; i++) {
    const modelInputs = facilities[i].modelInputs;
    facilitiesCounties = Object.values(pick(modelInputs, "countyName"));
  }

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
  let sevenDayDiffInCases = 0;
  let perCapitaCountyCases: PerCapitaCountyCase[] = [];
  let highestFourCounties: PerCapitaCountyCase[] = [];
  let facilitiesInHighestCounties = "";

  if (dayOne?.stateName && daySeven?.stateName) {
    const stateLocaleData = localeData?.get(dayOne.stateName);
    sevenDayDiffInCases = daySeven.cases - dayOne.cases;

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

  if (!scenarioLoading && !facilitiesState.loading && !facilities.length) {
    return <div>Missing scenario data for state: {stateName}</div>;
  }

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
                <Left />
                <Right marginRight={COLUMN_SPACING}>since last week</Right>
              </TextContainer>
            </td>
            <td>
              <TextContainer>
                <Left>
                  {numFacilitiesThisWeek} of {totalNumFacilities}{" "}
                </Left>
                <Right marginRight={COLUMN_SPACING}>
                  {getDirection(numFacilitiesLastWeek, numFacilitiesThisWeek)}
                  {numFacilitiesLastWeek} since last week
                </Right>
              </TextContainer>
            </td>
          </Table>
          <tr>
            <TableHeading>
              <BorderDiv>
                <TextContainerHeading>
                  <LeftHeading marginTop={"0px"}>Counties to watch</LeftHeading>
                  <Right>Change in cases per 100k since last week</Right>
                </TextContainerHeading>
              </BorderDiv>
              <HorizontalRule />
            </TableHeading>
          </tr>
          {highestFourCounties.map((row) =>
            makeCountyRow(row, facilitiesCounties),
          )}
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
