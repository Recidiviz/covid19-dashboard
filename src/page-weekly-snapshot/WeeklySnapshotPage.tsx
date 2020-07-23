import { format, startOfToday } from "date-fns";
import { get } from "lodash";
import React from "react";
import styled from "styled-components";

import Loading from "../design-system/Loading";
import { useLocaleDataState } from "../locale-data-context";
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
} from "./shared";
import SnapshotPage from "./SnapshotPage";
import SystemWideProjectionChart from "./SystemWideProjectionChart";
import { useWeeklyReport } from "./weekly-report-context/WeeklyReportContext";

const WeeklySnapshotPageDiv = styled.div``;
const WeeklySnapshotContainer = styled.div``;

const WeeklySnapshotPage: React.FC = () => {
  const localeState = useLocaleDataState();
  const {
    state: { stateName },
  } = useWeeklyReport();
  const today = startOfToday();
  const todayFormatted = format(today, "LLLL dd, yyyy");
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
                <LeftHeading>
                  {stateName} / {todayFormatted} / Year-to-date projected impact
                  on the incarcerated and staff
                </LeftHeading>
                <Right>
                  DOCR data as of: xx/xx/xx Community cases as of: xx/xx/xx
                </Right>
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
