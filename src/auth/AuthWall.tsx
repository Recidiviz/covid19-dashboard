import React, { useEffect } from "react";
import { Redirect, useLocation } from "react-router-dom";

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
    return <Loading />;
  }

  if (user && !user.email_verified) {
    return <Redirect to="/verify" />;
  }

  // We could be here if loginWithRedirect hasn't completed yet.
  if (!isAuthenticated) {
    return <Loading />;
  }

  return <>{props.children}</>;
};

export default AuthWall;
