import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

import Loading from "../design-system/Loading";
import { useAuth0 } from "./react-auth0-spa";

const AuthWall: React.FC = (props) => {
  const location = useLocation();
  const { loading, isAuthenticated, loginWithRedirect } = useAuth0() as any;

  useEffect(() => {
    if (loading || isAuthenticated) {
      return;
    }

    const fn = async () => {
      await loginWithRedirect({
        appState: { targetUrl: location.pathname },
      });
    };
    fn();
  }, [loading, isAuthenticated, loginWithRedirect, location.pathname]);

  if (loading) {
    return <Loading />;
  }

  let inner = isAuthenticated === true ? props.children : null;

  return <>{inner}</>;
};

export default AuthWall;
