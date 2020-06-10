import { useAuth0 } from "../auth/react-auth0-spa";
import { METADATA_NAMESPACE } from "../constants/auth";

const adminKey = `${METADATA_NAMESPACE}admin`;

const useAdminUser = (): boolean => {
  const { user } = useAuth0() as any;
  return !!(user && user[adminKey]);
};

export default useAdminUser;
