import AboutPage from "../page-about/AboutPage";
import FormPage from "../page-form/FormPage";
import GetInvolvedPage from "../page-get-involved/GetInvolvedPage";
import OverviewPage from "../page-overview/OverviewPage";
import TestPage from "../page-test/TestPage";
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
    isPrivate: false,
    contents: <OverviewPage />,
  },
  {
    path: "/about",
    title: getPageTitle("About"),
    isPrivate: false,
    contents: <AboutPage />,
  },
  {
    path: "/get-involved",
    title: getPageTitle("Get Involved"),
    isPrivate: false,
    contents: <GetInvolvedPage />,
  },
  {
    path: "/contribute",
    title: getPageTitle("Contribute"),
    isPrivate: true,
    contents: <FormPage />,
  },
  {
    path: "/test-page",
    title: getPageTitle("Test Page"),
    isPrivate: true,
    contents: <TestPage />,
  },
];

export default PageList;
