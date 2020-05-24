// @ts-nocheck
import React from "react";

import SiteProvider from "./src/providers/site-provider/SiteProvider";

// Some libraries, including semiotic, assume the global variable `self` is
// defined. This is true in the browser but not when running Gatsby from Node.
global.self = global;

export const wrapRootElement = ({ element }) => (
  <SiteProvider>{element}</SiteProvider>
);
