import React from "react";

import AuthWall from "../auth/AuthWall";
import FacilityPage from "../page-multi-facility/FacilityPage";
import PageInfo from "../site-metadata/PageInfo";

// eslint-disable-next-line react/display-name
export default () => (
  <>
    <PageInfo title="Facility" />
    <AuthWall>
      <FacilityPage />
    </AuthWall>
  </>
);
