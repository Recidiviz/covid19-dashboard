import React from "react";

import AuthWall from "../auth/AuthWall";
import MultiFacilityPage from "../page-multi-facility/MultiFacilityPage";
import PageInfo from "../site-metadata/PageInfo";

// eslint-disable-next-line react/display-name
export default () => (
  <>
    <PageInfo title={undefined} />
    <AuthWall>
      <MultiFacilityPage />
    </AuthWall>
  </>
);
