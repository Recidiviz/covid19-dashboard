import React from "react";

import PageInfo from "../components/site-metadata/PageInfo";
import ResponseImpactPage from "../page-response-impact/ResponseImpactPage";
import AuthWall from "../providers/auth/AuthWall";

// eslint-disable-next-line react/display-name
export default () => (
  <>
    <PageInfo title="Response Impact" />
    <AuthWall>
      <ResponseImpactPage />
    </AuthWall>
  </>
);
