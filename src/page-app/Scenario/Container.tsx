import React from "react";
import { Redirect, useParams } from "react-router-dom";

import { Routes } from "../../constants/Routes";
import { ReplaceUrlParams } from "../../helpers/Routing";
import useScenario from "../../scenario-context/useScenario";

// eslint-disable-next-line react/display-name
export default (props: {children: any}) => {
  const [scenario] = useScenario();
  const {scenarioId: scenarioIdParam} = useParams();

  if (!scenario.data) {
    return null;
  }

  const shouldRewriteUrl =
    !!scenario.data && scenarioIdParam !== scenario.data.id;
  const params = { scenarioId: scenario.data.id };
  const scenarioPath = ReplaceUrlParams(Routes.Scenario.url, params);

  return !shouldRewriteUrl ? props.children : <Redirect to={scenarioPath} />;
};
