import { navigate } from "gatsby";
import React, { useEffect } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";

import { getBaselineScenario } from "../database";
import Loading from "../design-system/Loading";
import { useToasts } from "../design-system/Toast";
import useScenario from "../scenario-context/useScenario";

const MultiFacilityFallback: React.FC<FallbackProps> = ({
  resetErrorBoundary,
}) => {
  const { addToast } = useToasts();
  const [, dispatchScenarioUpdate] = useScenario();

  useEffect(
    () => {
      getBaselineScenario().then((baselineScenario) => {
        addToast(
          "Something went wrong. You will be returned to your baseline scenario.",
        );
        if (baselineScenario) {
          dispatchScenarioUpdate(baselineScenario);
        }
        navigate("/");
        resetErrorBoundary();
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return <Loading />;
};

const MultiFacilityErrorBoundary: React.FC = ({ children }) => {
  const { addToast } = useToasts();
  return (
    <ErrorBoundary
      FallbackComponent={MultiFacilityFallback}
      onError={(e) => addToast(e.message)}
    >
      {children}
    </ErrorBoundary>
  );
};

export default MultiFacilityErrorBoundary;
