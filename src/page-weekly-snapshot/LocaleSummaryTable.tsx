import { differenceInWeeks, isThisWeek, startOfToday } from "date-fns";
import { get, maxBy, minBy, orderBy } from "lodash";
import numeral from "numeral";
import React, { useEffect, useState } from "react";

import { DateMMMMdyyyy } from "../design-system/DateFormats";
import InputSelect from "../design-system/InputSelect";
import Loading from "../design-system/Loading";
import { Column, PageContainer } from "../design-system/PageColumn";
import { useFacilities } from "../facilities-context";
import { userFacility } from "../facilities-context/__fixtures__";
import {
  getNewestRt,
  getRtDataForFacility,
  isRtData,
} from "../infection-model/rt";
import {
  LocaleDataProvider,
  LocaleRecord,
  useLocaleDataState,
} from "../locale-data-context";
import { Facility } from "../page-multi-facility/types";
import facility from "../pages/facility";
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
  TOP_BOTTOM_MARGIN,
} from "./shared";
import { UPDATE_STATE_NAME, useWeeklyReport } from "./weekly-report-context";

const stateNamesFilter = (key: string) =>
  !["US Total", "US Federal Prisons"].includes(key);
const formatNumber = (number: number) => numeral(number).format("0,0");

type PerCapitaCountyCase = {
  name: string;
  casesIncreasePerCapita: number | undefined;
};

type FacilityRtIncrease = {
  numFacilitiesThisWeek: number;
  numFacilitiesLastWeek: number;
  totalNumFacilities: number;
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
        <Left marginTop={TOP_BOTTOM_MARGIN} marginBottom={TOP_BOTTOM_MARGIN}>
          {caseIncreasePerCapita.name}{" "}
        </Left>
        <Right>
          {direction} {num}
        </Right>
      </TextContainerHeading>
      <HorizontalRule />
    </tr>
  );
}

async function getNumFacilitiesRt(facilities: Facility[]) {
  console.log("HERE");
  let numThisWeek = 0;
  let numLastWeek = 0;
  for (let i = 0; i < facilities.length; i++) {
    const facilityRtData = await getRtDataForFacility(facilities[i]);
    console.log(facilityRtData);
    if (isRtData(facilityRtData)) {
      const mostRecentRt = getNewestRt(facilityRtData.Rt);
      const allRtData = facilityRtData.Rt;
      console.log(mostRecentRt);
      if (
        mostRecentRt &&
        mostRecentRt.value > 0.01 &&
        isThisWeek(mostRecentRt.date)
      ) {
        numThisWeek += 1;
      }
      if (
        allRtData.length > 1 &&
        allRtData[allRtData.length - 2]?.value > 1 &&
        differenceInWeeks(allRtData[allRtData.length - 2]?.date, startOfToday())
      ) {
        numLastWeek += 1;
      }
    }
  }
  const facilityRtIncrease: FacilityRtIncrease = {
    numFacilitiesThisWeek: numThisWeek,
    numFacilitiesLastWeek: numLastWeek,
    totalNumFacilities: facilities.length,
  };
  console.log(facilityRtIncrease);
  return facilityRtIncrease;
}

const LocaleSummaryTable: React.FC<{}> = () => {
  const [facilityRtIncrease, setFacilityRtIncrease] = useState<
    FacilityRtIncrease | undefined
  >();
  const { data: localeDataSource } = useLocaleDataState();
  const { state: facilitiesState } = useFacilities();
  const {
    state: { stateName, loading: scenarioLoading },
  } = useWeeklyReport();

  const facilities = Object.values(facilitiesState.facilities);
  const modelVersions = facilities.map((f) => f.modelVersions);

  useEffect(() => {
    let mounted = true;
    async function fetchFacility() {
      const facilitiesX = await getNumFacilitiesRt(facilities);
      setFacilityRtIncrease(facilitiesX);
    }
    fetchFacility();
    return () => {
      mounted = false;
    };
  }, []);

  const { data, loading: nytLoading } = useNYTData();
  const { data: localeData, loading } = useLocaleDataState();

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
    const totalLocaleData = stateLocaleData?.get("Total");
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
                {/* <DeltaColor delta={1.2}> */}
                <Left />
                {/* </DeltaColor> */}
                <Right marginRight={COLUMN_SPACING}>since last week</Right>
              </TextContainer>
            </td>
            <td>
              <TextContainer>
                <Left>3 of 14 </Left>
                <Right marginRight={COLUMN_SPACING}>-2 since last week</Right>
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
