import styled from "styled-components";

import ImpactDashboard from "../impact-dashboard";
import SiteHeader from "../site-header/SiteHeader";

const OverviewPageDiv = styled.div``;

const OverviewPage: React.FC = () => {
  return (
    <OverviewPageDiv>
      <div className="font-body text-green min-h-screen tracking-normal w-full">
        <div className="max-w-screen-xl px-4 mx-auto">
          <SiteHeader />
          <main className="my-6">
            <ImpactDashboard />
          </main>
        </div>
      </div>
    </OverviewPageDiv>
  );
};

export default OverviewPage;
