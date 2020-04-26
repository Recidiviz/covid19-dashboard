import React from "react";
import { Helmet } from "react-helmet";

import { GlobalStyles } from "../site-styles/styles";

function getFullPageTitle(pageTitle?: string) {
  let parts = ["Recidiviz", "Covid-19 Incarceration Model"];
  if (pageTitle) parts.push(pageTitle);

  return parts.join(" • ");
}

interface Props {
  title: string | undefined;
  children?: undefined;
}

const PageInfo: React.FC<Props> = (props) => (
  <>
    {/*
     * Note: When placed in SiteProvider, GlobalStyles doesn't get compiled
     * into the static HTML. It might be that Gatsby only renders the page
     * and not the wrapping elements when collecting styles -- I'm not sure.
     *
     * An easy way to test whether Gatsby has fixed this bug in the future is
     * to turn off JavaScript and load a statically compiled page.
     */}
    <GlobalStyles />
    <Helmet>
      <title>{getFullPageTitle(props.title)}</title>
    </Helmet>
  </>
);

export default PageInfo;
