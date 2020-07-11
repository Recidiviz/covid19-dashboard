import React from "react";
import styled from "styled-components";

import Loading from "../design-system/Loading";
import { useFacilities } from "../facilities-context";
import { useLocaleDataState } from "../locale-data-context";
import FacilitySummaries from "./FacilitySummaries";
import ImpactProjectionChart from "./ImpactProjectionChart";
import LocaleSummary from "./LocaleSummary";
import SnapshotPage from "./SnapshotPage";
import SystemWideProjectionChart from "./SystemWideProjectionChart";
import { useWeeklyReport } from "./weekly-report-context";

const WeeklySnapshotPageDiv = styled.div``;
const WeeklySnapshotContainer = styled.div``;

const WeeklySnapshotPage: React.FC = () => {
  const localeState = useLocaleDataState();
  const {
    state: { scenario, loading: scenarioLoading },
  } = useWeeklyReport();
  const {
    state: { loading, facilities: facilitiesState, rtData },
  } = useFacilities();
  const facilities = Object.values(facilitiesState);

  return (
    <WeeklySnapshotPageDiv>
      <div className="font-body min-h-screen tracking-normal w-full">
        <div className="max-w-screen-xl px-4 mx-auto">
          {localeState.loading || scenarioLoading ? (
            <Loading />
          ) : (
            scenario && (
              <WeeklySnapshotContainer>
                <SnapshotPage header="COVID-19 Report" subheader>
                  YTD Summary and impact report
                  <ImpactProjectionChart />
                </SnapshotPage>
                <SnapshotPage header="System Snapshot" subheader>
                  <SystemWideProjectionChart />
                  <LocaleSummary />
                </SnapshotPage>
                <FacilitySummaries
                  localeData={localeState.data}
                  loading={loading}
                  facilities={facilities}
                  rtData={rtData}
                />
              </WeeklySnapshotContainer>
            )
          )}
        </div>
      </div>
    </WeeklySnapshotPageDiv>
  );
};

export default WeeklySnapshotPage;
