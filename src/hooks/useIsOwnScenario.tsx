import { Scenario } from "../page-multi-facility/types";
import useCurrentUserId from "./useCurrentUserId";

const useIsOwnScenario = (scenario: Scenario | null): boolean => {
  const currentUserId = useCurrentUserId();
  return scenario?.roles[currentUserId] === "owner";
};

export default useIsOwnScenario;
