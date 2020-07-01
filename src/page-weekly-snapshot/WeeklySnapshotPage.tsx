import React from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import FacilityProjections from "./FacilityProjections";
import LocaleSummary from "./LocaleSummary";

const WeeklySnapshotContainer = styled.div``;

const HorizontalRule = styled.hr`
  border-color: ${Colors.opacityGray};
  margin: 10px 0;
`;

const Placeholder = styled.div`
  padding: 20px;
  margin: 20px;
  font-size: 18px;
`;

const FooterContainer = styled.div`
  font-family: Libre Franklin;
  font-size: 11px;
  width: 100%;
  display: flex;
  justify-content: space-between;
`;

const FooterLeft = styled.div`
  text-align: left;
`;

const FooterRight = styled.div`
  text-align: right;
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
          <HorizontalRule />
          <FooterContainer>
            <FooterLeft>Log in to update data: model.recividiz.org</FooterLeft>
            <FooterRight>
              Questions and feedback: covid@recidiviz.org
            </FooterRight>
          </FooterContainer>
          <HorizontalRule />
        </div>
      </div>
    </WeeklySnapshotContainer>
  );
}
