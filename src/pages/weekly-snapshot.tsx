import React from "react";
import { createGlobalStyle } from "styled-components";

import AuthWall from "../auth/AuthWall";
import useAdminUser from "../hooks/useAdminUser";
import WeeklySnapshotPage from "../page-weekly-snapshot";
import { NYTDataProvider } from "../page-weekly-snapshot/NYTDataProvider";
import PageInfo from "../site-metadata/PageInfo";

const GlobalStyleWhite = createGlobalStyle`
  body {
    background-color: #fff;
    color: #000;
  }
`;

// eslint-disable-next-line react/display-name
export default () => {
  const isAdminUser: boolean = useAdminUser();

  return (
    <>
      {isAdminUser ? (
        <>
          <PageInfo title="Generate State-level Weekly Snapshot" />
          <GlobalStyleWhite />
          <AuthWall>
            <NYTDataProvider>
              <WeeklySnapshotPage />
            </NYTDataProvider>
          </AuthWall>
        </>
      ) : (
        <div>This page is only available for admin users</div>
      )}
    </>
  );
};
