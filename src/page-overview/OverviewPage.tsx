import styled from "styled-components";

import Colors from "../design-system/Colors";
import ImpactDashboard from "../impact-dashboard";
import SiteHeader from "../site-header/SiteHeader";

const Headline = styled.h1`
  color: ${Colors.forest};
  font-size: 36px;
  margin-bottom: 72px;
  margin-top: 30px;
  text-align: center;
`;
const OverviewPageDiv = styled.div``;

const OverviewPage: React.FC = () => {
  return (
    <OverviewPageDiv>
      <div className="font-body text-green min-h-screen tracking-normal w-full">
        <div className="max-w-screen-xl px-4 mx-auto">
          <SiteHeader />
          <main className="my-6">
            <Headline>
              Customize the COVID-19 Incarceration Model for Your Facilities
            </Headline>
            <ImpactDashboard />
          </main>
        </div>
      </div>
    </OverviewPageDiv>
  );
};

export default OverviewPage;
