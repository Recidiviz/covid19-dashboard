import React from "react";

import AuthWall from "../auth/AuthWall";
import WeeklySnapshotPage from "../page-weekly-snapshot";
import PageInfo from "../site-metadata/PageInfo";

// eslint-disable-next-line react/display-name
export default () => (
  <>
    <PageInfo title="Generate State-level Weekly Snapshot" />
    <AuthWall>
      <WeeklySnapshotPage />
    </AuthWall>
  </>
);
