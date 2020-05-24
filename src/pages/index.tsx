import React from "react";

import AuthWall from "../auth/AuthWall";
import PageInfo from "../components/site-metadata/PageInfo";
import MultiFacilityPage from "../page-multi-facility/MultiFacilityPage";

// eslint-disable-next-line react/display-name
export default () => (
  <>
    <PageInfo title={undefined} />
    <AuthWall>
      <MultiFacilityPage />
    </AuthWall>
  </>
);
