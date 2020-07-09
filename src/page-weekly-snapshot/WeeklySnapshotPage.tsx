import React from "react";
import styled from "styled-components";

import Loading from "../design-system/Loading";
import { useFacilities } from "../facilities-context";
import { useLocaleDataState } from "../locale-data-context";
import useScenario from "../scenario-context/useScenario";
import FacilitySummaries from "./FacilitySummaries";
import LocaleSummary from "./LocaleSummary";
import SnapshotPage from "./SnapshotPage";
import SystemWideProjectionChart from "./SystemWideProjectionChart";

const WeeklySnapshotPageDiv = styled.div``;
const WeeklySnapshotContainer = styled.div``;

const WeeklySnapshotPage: React.FC = () => {
  const localeState = useLocaleDataState();
  const [scenario] = useScenario();
  const {
    state: { loading, facilities: facilitiesState, rtData },
  } = useFacilities();
  const facilities = Object.values(facilitiesState);

  return (
    <WeeklySnapshotPageDiv>
      <div className="font-body min-h-screen tracking-normal w-full">
        <div className="max-w-screen-xl px-4 mx-auto">
          {localeState.loading || scenario.loading ? (
            <Loading />
          ) : (
            scenario.data && (
              <WeeklySnapshotContainer>
                <SnapshotPage header="COVID-19 Report" subheader>
                  YTD Summary and impact report
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
