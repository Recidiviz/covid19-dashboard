import styled from "styled-components";

import ChartArea from "./ChartArea";
import { useEpidemicModelState } from "./EpidemicModelContext";
import FacilityInformation from "./FacilityInformation";
import ImpactProjectionTable from "./ImpactProjectionTableContainer";
import LocaleInformation from "./LocaleInformation";

const SectionHeader = styled.header`
  font-family: Poppins;
  font-style: normal;
  font-weight: 600;
  font-size: 18px;
  line-height: 16px;
  margin-bottom: 16px;
`;

const SubsectionHeader = styled.header`
  font-family: Poppins;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 16px;
`;

/* Charts */

const ChartsContainer = styled.div`
  flex: 2 0 auto;
  width: 350px;
  margin: 0 15px;
`;

const ErrorMessage = styled.div`
  margin: 10px;
`;

const ImpactDashboardVDiv = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

const FormColumn = styled.div`
  flex: 1 0 auto;
  width: 350px;
`;

const ImpactDashboard: React.FC = () => {
  const { countyLevelDataFailed } = useEpidemicModelState();
  return (
    <div>
      {countyLevelDataFailed ? (
        <ErrorMessage>Error: unable to load data!</ErrorMessage>
      ) : (
        <>
          <SectionHeader>Locale Information</SectionHeader>
          <LocaleInformation />
          <SectionHeader>Facility Customization</SectionHeader>
          <ImpactDashboardVDiv>
            <FormColumn>
              <SubsectionHeader>Facility Information</SubsectionHeader>
              <FacilityInformation />
            </FormColumn>
            <ChartsContainer>
              <ChartArea />
              <ImpactProjectionTable />
            </ChartsContainer>
          </ImpactDashboardVDiv>
        </>
      )}
    </div>
  );
};

export default ImpactDashboard;
