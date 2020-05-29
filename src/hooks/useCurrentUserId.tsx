import { useAuth0 } from "../auth/react-auth0-spa";

const useCurrentUserId = (): string => {
  const { user } = (useAuth0 as any)();

  return user.sub;
};

export default useCurrentUserId;
