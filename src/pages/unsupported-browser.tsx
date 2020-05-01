import React from "react";

import UnsupportedBrowserPage from "../page-unsupported-browser/UnsupportedBrowserPage";
import PageInfo from "../site-metadata/PageInfo";

// eslint-disable-next-line react/display-name
export default () => (
  <>
    <PageInfo title="Unsupported Browser" />
    <UnsupportedBrowserPage />
  </>
);
