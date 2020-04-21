import GetInvolvedPage from "../page-get-involved/GetInvolvedPage";
import ModelInspectionPage from "../page-model-inspection/";
import FacilityPage from "../page-multi-facility/FacilityPage";
import MultiFacilityPage from "../page-multi-facility/MultiFacilityPage";
import UnsupportedBrowserPage from "../page-unsupported-browser/UnsupportedBrowserPage";
import VerificationNeeded from "../page-verification-needed/VerificationNeeded";

export interface PageInfo {
  path: string;
  title: string;
  isPrivate: boolean;
  contents: React.ReactNode;
}

function getPageTitle(...parts: string[]) {
  return [...parts, "COVID-19 Dashboard"].join(" • ");
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
    title: getPageTitle(),
    isPrivate: true,
    contents: <FacilityPage />,
  },
  {
    path: "/inspect-model",
    title: getPageTitle("Inspect epidemic model output"),
    isPrivate: true,
    contents: <ModelInspectionPage />,
  },
  {
    path: "/inspect-model",
    title: getPageTitle("Inspect epidemic model output"),
    isPrivate: true,
    contents: <ModelInspectionPage />,
  },
];

export default PageList;
