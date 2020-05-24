// @ts-nocheck
import "whatwg-fetch"; // Defines the fetch API for IE11

import React from "react";

import SiteProvider from "./src/providers/site-provider/SiteProvider";

export const wrapRootElement = ({ element }) => (
  <SiteProvider>{element}</SiteProvider>
);
