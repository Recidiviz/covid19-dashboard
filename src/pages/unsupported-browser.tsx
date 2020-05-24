import React from "react";

import PageInfo from "../components/site-metadata/PageInfo";
import UnsupportedBrowserPage from "../page-unsupported-browser/UnsupportedBrowserPage";

// eslint-disable-next-line react/display-name
export default () => (
  <>
    <PageInfo title="Unsupported Browser" />
    <UnsupportedBrowserPage />
  </>
);
