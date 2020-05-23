import { useLocation } from "@reach/router";
import { navigate } from "gatsby";
import React, { useEffect } from "react";

import { Routes } from "../constants/Routes";
import Loading from "../design-system/Loading";
import { useAuth0 } from "./react-auth0-spa";

const AuthWall: React.FC = (props) => {
  const location = useLocation();
  const {
    loading,
    isAuthenticated,
    loginWithRedirect,
    user,
  } = useAuth0() as any;

  useEffect(() => {
    if (loading || isAuthenticated) return;

    loginWithRedirect({ appState: { targetUrl: location.pathname } });
  }, [loading, isAuthenticated, loginWithRedirect, location.pathname]);

  if (loading) {
    return (
      <Loading
        styles={{
          marginTop: "40px",
          minHeight: "350px",
        }}
      />
    );
  }

  if (user && !user.email_verified) {
    navigate(Routes.Verify.url, { replace: true });
    return null;
  }

  // We could be here if loginWithRedirect hasn't completed yet.
  if (!isAuthenticated) {
    return (
      <Loading
        styles={{
          marginTop: "40px",
          minHeight: "350px",
        }}
      />
    );
  }

  return <>{props.children}</>;
};

export default AuthWall;
