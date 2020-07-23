import { format, max, startOfToday, startOfYesterday } from "date-fns";
import { get } from "lodash";
import React from "react";
import styled from "styled-components";

import Loading from "../design-system/Loading";
import { useFacilities } from "../facilities-context";
import {
  findMatchingDay,
  findMostRecentDate,
} from "../hooks/useAddCasesInputs";
import { useLocaleDataState } from "../locale-data-context";
import { Facility } from "../page-multi-facility/types";
import FacilitySummaries from "./FacilitySummaries";
import ImpactProjectionChart from "./ImpactProjectionChart";
import LocaleStatsTable from "./LocaleStatsTable";
import LocaleSummary from "./LocaleSummary";
import {
  BorderDiv,
  HorizontalRule,
  LeftHeading,
  Right,
  STATE_CODE_MAPPING,
  TextContainer,
} from "./shared";
import SnapshotPage from "./SnapshotPage";
import SystemWideProjectionChart from "./SystemWideProjectionChart";
import { useWeeklyReport } from "./weekly-report-context/WeeklyReportContext";

const WeeklySnapshotPageDiv = styled.div``;
const WeeklySnapshotContainer = styled.div``;

function getMostRecentDOCRDate(facilities: Facility[]) {
  let mostRecentDate = undefined;
  for (let i = 0; i < facilities.length; i++) {
    const facility = facilities[i];
    const hasEarlierData = facility.modelVersions.length > 1;
    let facilityMostRecentDate = undefined;

    if (hasEarlierData) {
      const currentDate = facility.updatedAt;
      facilityMostRecentDate = findMostRecentDate(
        currentDate,
        facility.modelVersions,
        false,
      );
      if (mostRecentDate === undefined) {
        mostRecentDate = facilityMostRecentDate;
      } else {
        mostRecentDate = max([mostRecentDate, facilityMostRecentDate]);
      }
    }
  }
  if (mostRecentDate) {
    return mostRecentDate;
  }
  return startOfToday();
}

const WeeklySnapshotPage: React.FC = () => {
  const localeState = useLocaleDataState();
  const {
    state: { stateName },
  } = useWeeklyReport();
  const { state: facilitiesState } = useFacilities();
  const facilities = Object.values(facilitiesState.facilities);

  const today = startOfToday();
  const todayFormatted = format(today, "LLLL dd, yyyy");

  const mostRecentDOCRDate = getMostRecentDOCRDate(facilities);
  const mostRecentDOCRDateFormatted = format(mostRecentDOCRDate, "MM/dd/yyyy");

  const yesterday = startOfYesterday();
  const yesterdayFormatted = format(yesterday, "MM/dd/yyyy");

  let stateImage = undefined;
  if (stateName && get(STATE_CODE_MAPPING, stateName)) {
    const stateCode = get(STATE_CODE_MAPPING, stateName);
    stateImage = require("../../public/state-svg-defs-master/SVG/" +
      stateCode +
      ".svg");
  }
  return (
    <WeeklySnapshotPageDiv>
      <div className="font-body min-h-screen tracking-normal w-full">
        <div className="max-w-screen-xl px-4 mx-auto">
          {localeState.loading ? (
            <Loading />
          ) : (
            <WeeklySnapshotContainer>
              <SnapshotPage
                image={stateImage}
                header="COVID-19 Report"
                subheader
              >
                <br />
                <BorderDiv />
                <TextContainer>
                  <LeftHeading marginTop={"0px"}>
                    {stateName} / {todayFormatted} / Year-to-date projected
                    impact on the incarcerated and staff
                  </LeftHeading>
                  <Right>
                    DOCR data as of: {mostRecentDOCRDateFormatted} Community
                    cases as of: {yesterdayFormatted}
                  </Right>
                </TextContainer>
                <HorizontalRule />
                <LocaleSummary />
                <ImpactProjectionChart />
              </SnapshotPage>
              <SnapshotPage header="System Snapshot" subheader>
                <SystemWideProjectionChart />
                <LocaleStatsTable />
              </SnapshotPage>
              <FacilitySummaries />
            </WeeklySnapshotContainer>
          )}
        </div>
      </div>
    </WeeklySnapshotPageDiv>
  );
};

export default WeeklySnapshotPage;
