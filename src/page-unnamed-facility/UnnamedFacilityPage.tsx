import React from "react";
import styled from "styled-components";

import ChartArea from "../impact-dashboard/ChartArea";
import { EpidemicModelProvider } from "../impact-dashboard/EpidemicModelContext";
import { useLocaleDataState } from "../locale-data-context";
import ImpactProjectionTable from "../impact-dashboard/ImpactProjectionTableContainer";
import SiteHeader from "../site-header/SiteHeader";
import FacilityInformationSection from "./FacilityInformationSection";
import LocaleInformationSection from "./LocaleInformationSection";
import RateOfSpreadSection from "./RateOfSpreadSection";

const UnnamedFacilityPageDiv = styled.div``;
const UnnamedFacilityInputForm = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;
const LeftColumn = styled.div`
  margin: 20px;
  // flex-basis: 30%;
`;
const RightColumn = styled.div`
  margin: 20px;
  // flex-basis: 40%;
`;

// TODO add section header tooltips
// TODO add summary at bottom of Locale Information
// TODO full page styling
// TODO rate of spread section
// TODO use FormGrid
const UnnamedFacilityPage: React.FC = () => {
  const { data: localeDataSource } = useLocaleDataState();

  return (
    <EpidemicModelProvider localeDataSource={localeDataSource}>
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
                <RateOfSpreadSection />
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
