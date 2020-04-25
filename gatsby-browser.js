// @ts-nocheck
import React from "react";

import SiteProvider from "./src/site-provider/SiteProvider";

export const wrapRootElement = ({ element }) => (
  <SiteProvider>{element}</SiteProvider>
);
