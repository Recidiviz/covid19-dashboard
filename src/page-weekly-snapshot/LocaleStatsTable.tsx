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
import { Facility } from "../page-multi-facility/types";
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
  RankContainer,
  RankText,
  Right,
  Table,
  TableHeading,
  TextContainer,
  TextContainerHeading,
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

function getFacilitiesInCountiesToWatch(
  facilities: Facility[],
  countiesToWatch: string[],
) {
  let result = "";
  for (let i = 0; i < facilities.length; i++) {
    const modelInputs = facilities[i].modelInputs;
    const facilitiesCountiesX = Object.values(pick(modelInputs, "countyName"));
    for (let j = 0; j < facilitiesCountiesX.length; j++) {
      const currCounty = facilitiesCountiesX[j];
      if (currCounty && countiesToWatch.includes(currCounty)) {
        result += facilities[i].name + ", ";
      }
    }
  }
  result = result.slice(0, -2);
  return result;
}

function getFacilitiesCounties(facilities: Facility[]) {
  let facilitiesCounties: string[] = [];
  for (let i = 0; i < facilities.length; i++) {
    const modelInputs = facilities[i].modelInputs;
    const counties = Object.values(pick(modelInputs, "countyName"));
    for (let j = 0; j < counties.length; j++) {
      const currCounty = counties[j];
      if (
        currCounty !== undefined &&
        !facilitiesCounties.includes(currCounty)
      ) {
        facilitiesCounties.push(currCounty);
      }
    }
  }
  return facilitiesCounties;
}

function makeCountyRow(
  caseIncreasePerCapita: PerCapitaCountyCase,
  facilitiesCounties: string[],
  index: number,
) {
  let num = numeral(caseIncreasePerCapita.casesIncreasePerCapita).format(
    "0.000%",
  );
  let direction = "+";
  if (caseIncreasePerCapita?.casesIncreasePerCapita) {
    direction = caseIncreasePerCapita?.casesIncreasePerCapita > 0 ? "+" : "-";
  }

  let name = caseIncreasePerCapita.name;
  if (facilitiesCounties.includes(name)) {
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
      <HorizontalRule />
    </tr>
  );
}

function makeFacilitiesToWatchRow(highestCountiesFacilities: string) {
  return (
    <tr>
      <TextContainerHeading>
        <Left>{highestCountiesFacilities}</Left>
      </TextContainerHeading>
    </tr>
  );
}

function makeTableHeading(heading: string) {
  return (
    <TableHeading>
      <BorderDiv marginRight={COLUMN_SPACING} />
      <TextContainer>{heading}</TextContainer>
      <HorizontalRule marginRight={COLUMN_SPACING} />
    </TableHeading>
  );
}

function makeTableSubheading(leftHeading: string, rightHeading: string) {
  return (
    <TableHeading>
      <BorderDiv>
        <TextContainer>
          <LeftHeading marginTop={"0px"}>{leftHeading}</LeftHeading>
          <Right>{rightHeading}</Right>
        </TextContainer>
      </BorderDiv>
      <HorizontalRule />
    </TableHeading>
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
              {makeTableHeading("State rate of spread")}
              {makeTableHeading("Facilities with rate of spread > 1")}
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
            {makeTableSubheading(
              "Counties to watch",
              "Change in cases per 100k since last week",
            )}
          </tr>
          {highestFourCounties.map((row, index) =>
            makeCountyRow(row, facilitiesCounties, index),
          )}
          <br />
          <tr>{makeTableSubheading("Facilities in counties to watch", "")}</tr>
          {makeFacilitiesToWatchRow(highestCountiesFacilities)}
        </Column>
      </PageContainer>
    </>
  );
};

export default LocaleStatsTable;
