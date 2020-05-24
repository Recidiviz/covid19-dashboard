import React from "react";

import AuthWall from "../auth/AuthWall";
import PageInfo from "../components/site-metadata/PageInfo";
import FacilityPage from "../page-multi-facility/FacilityPage";

// eslint-disable-next-line react/display-name
export default () => (
  <>
    <PageInfo title="Facility" />
    <AuthWall>
      <FacilityPage />
    </AuthWall>
  </>
);
