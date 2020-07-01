import React from "react";

import AuthWall from "../auth/AuthWall";
import useAdminUser from "../hooks/useAdminUser";
import WeeklySnapshotPage from "../page-weekly-snapshot";
import { NYTDataProvider } from "../page-weekly-snapshot/NYTDataProvider";
import { WeeklyReportProvider } from "../page-weekly-snapshot/WeeklyReportContext";
import PageInfo from "../site-metadata/PageInfo";

// eslint-disable-next-line react/display-name
export default () => {
  const isAdminUser: boolean = useAdminUser();

  return (
    <>
      {isAdminUser ? (
        <>
          <PageInfo title="Generate State-level Weekly Snapshot" />
          <AuthWall>
            <WeeklyReportProvider>
              <NYTDataProvider>
                <WeeklySnapshotPage />
              </NYTDataProvider>
            </WeeklyReportProvider>
          </AuthWall>
        </>
      ) : (
        <div>This page is only available for admin users</div>
      )}
    </>
  );
};
