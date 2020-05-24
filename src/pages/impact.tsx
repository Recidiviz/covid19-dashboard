import React from "react";

import AuthWall from "../auth/AuthWall";
import PageInfo from "../components/site-metadata/PageInfo";
import ResponseImpactPage from "../page-response-impact/ResponseImpactPage";

// eslint-disable-next-line react/display-name
export default () => (
  <>
    <PageInfo title="Response Impact" />
    <AuthWall>
      <ResponseImpactPage />
    </AuthWall>
  </>
);
