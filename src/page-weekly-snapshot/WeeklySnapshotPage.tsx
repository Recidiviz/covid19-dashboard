import React from "react";
import styled from "styled-components";

import FacilitySummaries from "./FacilitySummaries";
import LocaleSummary from "./LocaleSummary";
import Page from "./Page";
import SystemWideProjectionChart from "./SystemWideProjectionChart";

const WeeklySnapshotContainer = styled.div``;

export default function WeeklySnapshotPage() {
  return (
    <WeeklySnapshotContainer>
      <div className="font-body min-h-screen tracking-normal w-full">
        <div className="max-w-screen-xl px-4 mx-auto">
          <Page header="COVID-19 Report" subheader>
            YTD Summary and impact report
          </Page>
          <Page header="System Snapshot" subheader>
            <SystemWideProjectionChart />
            <LocaleSummary />
          </Page>
          <FacilitySummaries />
        </div>
      </div>
    </WeeklySnapshotContainer>
  );
}
