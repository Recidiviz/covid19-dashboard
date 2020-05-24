import React from "react";

import PageInfo from "../components/site-metadata/PageInfo";
import MultiFacilityPage from "../page-multi-facility/MultiFacilityPage";
import AuthWall from "../providers/auth/AuthWall";

// eslint-disable-next-line react/display-name
export default () => (
  <>
    <PageInfo title={undefined} />
    <AuthWall>
      <MultiFacilityPage />
    </AuthWall>
  </>
);
