import React from "react";

import GetInvolvedPage from "../page-get-involved/GetInvolvedPage";
import ModelInspectionPage from "../page-model-inspection/";
import FacilityPage from "../page-multi-facility/FacilityPage";
import MultiFacilityPage from "../page-multi-facility/MultiFacilityPage";
import ResponseImpactPage from "../page-response-impact/ResponseImpactPage";
import UnsupportedBrowserPage from "../page-unsupported-browser/UnsupportedBrowserPage";
import VerificationNeeded from "../page-verification-needed/VerificationNeeded";

export interface PageInfo {
  path: string;
  title: string;
  isPrivate: boolean;
  contents: React.ReactNode;
}

function getPageTitle(...parts: string[]) {
  return ["Recidiviz", "Covid-19 Incarceration Model", ...parts].join(" • ");
}

const PageList: PageInfo[] = [
  {
    path: "/",
    title: getPageTitle(),
    isPrivate: true,
    contents: <MultiFacilityPage />,
  },
  {
    path: "/get-involved",
    title: getPageTitle("Get Involved"),
    isPrivate: false,
    contents: <GetInvolvedPage />,
  },
  {
    path: "/unsupported-browser",
    title: getPageTitle("Unsupported Browser"),
    isPrivate: false,
    contents: <UnsupportedBrowserPage />,
  },
  {
    path: "/verify",
    title: getPageTitle("Verification Needed"),
    isPrivate: false,
    contents: <VerificationNeeded />,
  },
  {
    path: "/facility",
    title: getPageTitle("Facility"),
    isPrivate: true,
    contents: <FacilityPage />,
  },
  {
    path: "/inspect-model",
    title: getPageTitle("Inspect Epidemic Model Output"),
    isPrivate: true,
    contents: <ModelInspectionPage />,
  },
  {
    path: "/impact",
    title: getPageTitle("Response Impact"),
    isPrivate: true,
    contents: <ResponseImpactPage />,
  },
];

export default PageList;
