import AboutPage from "../page-about/AboutPage";
import FormPage from "../page-form/FormPage";
import GetInvolvedPage from "../page-get-involved/GetInvolvedPage";
import OverviewPage from "../page-overview/OverviewPage";
import TestPage from "../page-test/TestPage";

export interface PageInfo {
  path: string;
  title: string;
  contents: React.ReactNode;
}

function getPageTitle(...parts: string[]) {
  return [...parts, "COVID-19 Dashboard"].join(" • ");
}

const PageList: PageInfo[] = [
  {
    path: "/",
    title: getPageTitle(),
    contents: <OverviewPage />,
  },
  {
    path: "/about",
    title: getPageTitle("About"),
    contents: <AboutPage />,
  },
  {
    path: "/get-involved",
    title: getPageTitle("Get Involved"),
    contents: <GetInvolvedPage />,
  },
  {
    path: "/contribute",
    title: getPageTitle("Contribute"),
    contents: <FormPage />,
  },
  {
    path: "/test-page",
    title: getPageTitle("Test Page"),
    contents: <TestPage />,
  },
];

export default PageList;
