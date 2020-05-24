import React from "react";

import AuthWall from "../auth/AuthWall";
import PageInfo from "../components/site-metadata/PageInfo";
import ModelInspectionPage from "../page-model-inspection/";

// eslint-disable-next-line react/display-name
export default () => (
  <>
    <PageInfo title="Inspect Epidemic Model Output" />
    <AuthWall>
      <ModelInspectionPage />
    </AuthWall>
  </>
);
