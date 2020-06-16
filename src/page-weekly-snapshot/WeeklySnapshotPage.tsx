import React from "react";
import styled from "styled-components";

import LocaleSummary from "./LocaleSummary";

const WeeklySnapshotContainer = styled.div``;

const Placeholder = styled.div`
  padding: 20px;
  margin: 20px;
`;

export default function WeeklySnapshotPage() {
  return (
    <WeeklySnapshotContainer>
      <div className="font-body text-black min-h-screen tracking-normal w-full">
        <div className="max-w-screen-xl px-4 mx-auto">
          <Placeholder>Page Header</Placeholder>
          <Placeholder>Year To Date Summary and Impact Report</Placeholder>
          <Placeholder>
            System Summary
            <LocaleSummary />
          </Placeholder>
          <Placeholder>Facility Pages</Placeholder>
          <Placeholder>Page Footer</Placeholder>
        </div>
      </div>
    </WeeklySnapshotContainer>
  );
}
