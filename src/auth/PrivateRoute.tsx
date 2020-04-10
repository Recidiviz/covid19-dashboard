import React, { useEffect } from "react";
import { Route } from "react-router-dom";

import { useAuth0 } from "./react-auth0-spa";

const PrivateRoute = ({ children, path, ...rest }: any) => {
  const { loading, isAuthenticated, loginWithRedirect } = useAuth0() as any;

  useEffect(() => {
    if (loading || isAuthenticated) {
      return;
    }
    const fn = async () => {
      await loginWithRedirect({
        appState: { targetUrl: window.location.pathname },
      });
    };
    fn();
  }, [loading, isAuthenticated, loginWithRedirect, path]);

  let inner = isAuthenticated === true ? children : null;

  return (
    <Route path={path} {...rest}>
      {inner}
    </Route>
  );
};

export default PrivateRoute;
