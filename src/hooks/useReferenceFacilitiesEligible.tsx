import { useFlag } from "../feature-flags";
import useScenario from "../scenario-context/useScenario";

const useReferenceFacilitiesEligible = (): boolean => {
  const [scenario] = useScenario();

  return useFlag(["enableShadowData"]) && !!scenario.data?.baseline;
};

export default useReferenceFacilitiesEligible;
