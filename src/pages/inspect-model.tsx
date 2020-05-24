import React from "react";

import PageInfo from "../components/site-metadata/PageInfo";
import ModelInspectionPage from "../page-model-inspection/";
import AuthWall from "../providers/auth/AuthWall";

// eslint-disable-next-line react/display-name
export default () => (
  <>
    <PageInfo title="Inspect Epidemic Model Output" />
    <AuthWall>
      <ModelInspectionPage />
    </AuthWall>
  </>
);
