import React from "react";
import styled from "styled-components";

import FacilityProjections from "./FacilityProjections";
import LocaleSummary from "./LocaleSummary";

const WeeklySnapshotContainer = styled.div``;

const Placeholder = styled.div`
  padding: 20px;
  margin: 20px;
  font-size: 18px;
`;

export default function WeeklySnapshotPage() {
  return (
    <WeeklySnapshotContainer>
      <div className="font-body min-h-screen tracking-normal w-full">
        <div className="max-w-screen-xl px-4 mx-auto">
          <Placeholder>Page Header</Placeholder>
          <Placeholder>Year To Date Summary and Impact Report</Placeholder>
          <Placeholder>
            System Summary
            <LocaleSummary />
          </Placeholder>
          <Placeholder>
            Facility Projections
            <FacilityProjections />
          </Placeholder>
          <Placeholder>Page Footer</Placeholder>
        </div>
      </div>
    </WeeklySnapshotContainer>
  );
}
