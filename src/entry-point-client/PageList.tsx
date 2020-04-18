import GetInvolvedPage from "../page-get-involved/GetInvolvedPage";
import LibraryCard from "../page-library/LibraryCard";
import OverviewPage from "../page-overview/OverviewPage";
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

export const VerificationNeededPage: PageInfo = {
  path: "/verify",
  title: getPageTitle("Verification Needed"),
  isPrivate: false,
  contents: <VerificationNeeded />,
};

const PageList: PageInfo[] = [
  {
    path: "/",
    title: getPageTitle(),
    isPrivate: true,
    contents: <OverviewPage />,
  },
  {
    path: "/get-involved",
    title: getPageTitle("Get Involved"),
    isPrivate: false,
    contents: <GetInvolvedPage />,
  },
  {
    path: "/library",
    title: getPageTitle("library Menu"),
    isPrivate: false,
    contents: <LibraryCard />,
  },
];

export default PageList;
