import React from "react";

import AuthWall from "../auth/AuthWall";
import ResponseImpactPage from "../page-response-impact/ResponseImpactPage";
import PageInfo from "../site-metadata/PageInfo";

// eslint-disable-next-line react/display-name
export default () => (
  <>
    <PageInfo title="Response Impact" />
    <AuthWall>
      <ResponseImpactPage />
    </AuthWall>
  </>
);
