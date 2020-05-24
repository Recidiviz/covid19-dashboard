import React from "react";

import PageInfo from "../components/site-metadata/PageInfo";
import FacilityPage from "../page-multi-facility/FacilityPage";
import AuthWall from "../providers/auth/AuthWall";

// eslint-disable-next-line react/display-name
export default () => (
  <>
    <PageInfo title="Facility" />
    <AuthWall>
      <FacilityPage />
    </AuthWall>
  </>
);
