import React from "react";

import AuthWall from "../auth/AuthWall";
import ModelInspectionPage from "../page-model-inspection/";
import PageInfo from "../site-metadata/PageInfo";

// eslint-disable-next-line react/display-name
export default () => (
  <AuthWall>
    <PageInfo title="Inspect Epidemic Model Output" />
    <ModelInspectionPage />
  </AuthWall>
);
