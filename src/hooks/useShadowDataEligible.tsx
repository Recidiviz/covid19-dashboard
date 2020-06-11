import { useFlag } from "../feature-flags";
import useScenario from "../scenario-context/useScenario";

const useShadowDataEligible = (): boolean => {
  const [scenario] = useScenario();

  return useFlag(["enableShadowData"]) && !!scenario.data?.baseline;
};

export default useShadowDataEligible;
