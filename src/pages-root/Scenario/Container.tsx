import { Redirect, useHistory, useLocation, useParams } from "react-router-dom";
import React from "react";

import Layout from "../../components/Layout";
import { Routes } from "../../constants/Routes";
import { ReplaceUrlParams } from "../../helpers/Routing";
import useScenario from "../../scenario-context/useScenario";

type Props = RouteComponentProps<{
  isRoot?: boolean;
  isNew?: boolean;
  children: any;
}>;

// eslint-disable-next-line react/display-name
export default (props: Props) => {
  const [scenario] = useScenario();
  const {scenarioId: scenarioIdParam} = useParams();

  if (!scenario.data) {
    return null;
  }

  const shouldRewriteUrl =
    !!scenario.data && scenarioIdParam !== scenario.data.id;
  const params = { scenarioId: scenario.data.id };
  const scenarioPath = ReplaceUrlParams(Routes.Scenario.url, params);

  if (shouldRewriteUrl) {
    return <Redirect to={scenarioPath} />
  } else {
    return <Layout>{props.children}</Layout>;
  }
};
