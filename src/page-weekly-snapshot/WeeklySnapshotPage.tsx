import React from "react";
import styled from "styled-components";

import Loading from "../design-system/Loading";
import { useLocaleDataState } from "../locale-data-context";
import FacilitySummaries from "./FacilitySummaries";
import ImpactProjectionChart from "./ImpactProjectionChart";
import LocaleSummary from "./LocaleSummary";
import LocaleSummaryTable from "./LocaleSummaryTable";
import SnapshotPage from "./SnapshotPage";
import SystemWideProjectionChart from "./SystemWideProjectionChart";

const WeeklySnapshotPageDiv = styled.div``;
const WeeklySnapshotContainer = styled.div``;

const WeeklySnapshotPage: React.FC = () => {
  const localeState = useLocaleDataState();
  return (
    <WeeklySnapshotPageDiv>
      <div className="font-body min-h-screen tracking-normal w-full">
        <div className="max-w-screen-xl px-4 mx-auto">
          {localeState.loading ? (
            <Loading />
          ) : (
            <WeeklySnapshotContainer>
              <SnapshotPage header="COVID-19 Report" subheader>
                YTD Summary and impact report
                <LocaleSummary />
                <ImpactProjectionChart />
              </SnapshotPage>
              <SnapshotPage header="System Snapshot" subheader>
                <SystemWideProjectionChart />
                <LocaleSummaryTable />
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
