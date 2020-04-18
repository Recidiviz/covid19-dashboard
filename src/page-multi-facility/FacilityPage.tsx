import React from "react";
import styled from "styled-components";

import ChartArea from "../impact-dashboard/ChartArea";
import { EpidemicModelProvider } from "../impact-dashboard/EpidemicModelContext";
import ImpactProjectionTable from "../impact-dashboard/ImpactProjectionTableContainer";
import { useLocaleDataState } from "../locale-data-context";
import SiteHeader from "../site-header/SiteHeader";
import FacilityInformationSection from "./FacilityInformationSection";
import LocaleInformationSection from "./LocaleInformationSection";
import RateOfSpreadSection from "./RateOfSpreadSection";

const FacilityPageDiv = styled.div``;
const FacilityInputForm = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;
const LeftColumn = styled.div`
  margin: 20px;
`;
const RightColumn = styled.div`
  margin: 20px;
`;

// TODO add section header tooltips
// TODO add summary at bottom of Locale Information
const FacilityPage: React.FC = () => {
  const { data: localeDataSource } = useLocaleDataState();

  return (
    <EpidemicModelProvider localeDataSource={localeDataSource}>
      <FacilityPageDiv>
        <div className="font-body text-green min-h-screen tracking-normal w-full">
          <div className="max-w-screen-xl px-4 mx-auto">
            <SiteHeader />
            <FacilityInputForm>
              <LeftColumn>
                <h1 className="text-3xl leading-none">Facility</h1>
                <div className="mt-5 mb-5 border-b border-gray-300" />
                <LocaleInformationSection />
                <FacilityInformationSection />
                <RateOfSpreadSection />
              </LeftColumn>
              <RightColumn>
                <ChartArea />
                <ImpactProjectionTable />
              </RightColumn>
            </FacilityInputForm>
          </div>
        </div>
      </FacilityPageDiv>
    </EpidemicModelProvider>
  );
};

export default FacilityPage;
