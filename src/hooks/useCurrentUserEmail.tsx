import { useAuth0 } from "../auth/react-auth0-spa";

const useCurrentUserEmail = (): string => {
  const { user } = (useAuth0 as any)();

  return user.email;
};

export default useCurrentUserEmail;
