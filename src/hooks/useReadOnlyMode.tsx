import { Scenario } from "../page-multi-facility/types";
import useCurrentUserId from "./useCurrentUserId";

const useReadOnlyMode = (scenario: Scenario | null): boolean => {
  const currentUserId = useCurrentUserId();
  if (!scenario) return false;

  const userRole = scenario.roles[currentUserId];
  return userRole != "owner";
};

export default useReadOnlyMode;
