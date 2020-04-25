import React from "react";
import { Helmet } from "react-helmet";

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
  <Helmet>
    <title>{getFullPageTitle(props.title)}</title>
  </Helmet>
);

export default PageInfo;
