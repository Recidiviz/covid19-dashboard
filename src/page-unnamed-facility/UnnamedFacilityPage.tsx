import React, { useState } from "react";
import styled from "styled-components";

import SiteHeader from "../site-header/SiteHeader";
import { EpidemicModelProvider } from "../impact-dashboard/EpidemicModelContext";
import ChartArea from "../impact-dashboard/ChartArea";
import ImpactProjectionTable from "../impact-dashboard/ImpactProjectionTableContainer";
import FacilityInformationSection from "./FacilityInformationSection";
import LocaleInformationSection from "./LocaleInformationSection"

const UnnamedFacilityPageDiv = styled.div``;
const UnnamedFacilityInputForm = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between
`;
const LeftColumn = styled.div`
  margin: 20px;
  // flex-basis: 30%;
`;
const RightColumn = styled.div`
  margin: 20px;
  // flex-basis: 40%;
`;

const UnnamedFacilityPage: React.FC = () => {
  return (
    <EpidemicModelProvider>
      <UnnamedFacilityPageDiv>
        <div className="font-body text-green min-h-screen tracking-normal w-full">
          <div className="max-w-screen-xl px-4 mx-auto">
            <SiteHeader />
            <UnnamedFacilityInputForm>
              <LeftColumn>
                <h1 className="text-3xl leading-none">Unnamed Facility</h1>
                <div className="mt-5 mb-5 border-b border-gray-300" />
                <LocaleInformationSection />
                <FacilityInformationSection />
              </LeftColumn>
              <RightColumn>
                <ChartArea />
                <ImpactProjectionTable />
              </RightColumn>
            </UnnamedFacilityInputForm>
          </div>
        </div>
      </UnnamedFacilityPageDiv>
    </EpidemicModelProvider>
  );
};

export default UnnamedFacilityPage;
