import { navigate, RouteComponentProps, useLocation } from "@reach/router";
import React from "react";

import Layout from "../../components/Layout";
import { Routes } from "../../constants/Routes";
import { ReplaceUrlParams, RouteParam } from "../../helpers/Routing";
import useScenario from "../../scenario-context/useScenario";

type Props = RouteComponentProps<{
  isRoot?: boolean;
  isNew?: boolean;
  children: any;
}>;

// eslint-disable-next-line react/display-name
export default (props: Props) => {
  const [scenario] = useScenario();
  const location = useLocation();

  if (!scenario.data) {
    return null;
  }

  const shouldRewriteUrl =
    !!scenario.data &&
    RouteParam(location.pathname, Routes.Scenario.name)?.scenarioId !==
      scenario.data?.id;
  const params = { scenarioId: scenario.data.id };
  const scenarioPath = ReplaceUrlParams(Routes.Scenario.url, params);

  if (shouldRewriteUrl) {
    navigate(scenarioPath, { replace: true });
    return null;
  } else {
    return <Layout>{props.children}</Layout>;
  }
};
