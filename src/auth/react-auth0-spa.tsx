// @ts-nocheck

import Auth0Client from "@auth0/auth0-spa-js/dist/typings/Auth0Client";
import { isEqualWith, pick } from "lodash";
import React, { useContext, useEffect, useState } from "react";

import { getUser, saveUser } from "../database";

const DEFAULT_REDIRECT_CALLBACK = () =>
  window.history.replaceState({}, document.title, window.location.pathname);

export const Auth0Context = React.createContext();
export const useAuth0 = () => {
  // Note: useContext() appears to return undefined when compiling statically.
  // We should look into that.
  return useContext(Auth0Context) || {};
};

interface Props {
  onRedirectCallback: () => void;
  auth0ClientPromise: Promise<Auth0Client>;
}

export const Auth0Provider: React.FC<Props> = ({
  children,
  onRedirectCallback = DEFAULT_REDIRECT_CALLBACK,
  auth0ClientPromise,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState();
  const [user, setUser] = useState();
  const [auth0Client, setAuth0Client] = useState();
  const [loading, setLoading] = useState(true);
  const [popupOpen, setPopupOpen] = useState(false);

  useEffect(() => {
    const initAuth0 = async () => {
      let auth0Client = await auth0ClientPromise;
      setAuth0Client(auth0Client);

      if (
        window.location.search.includes("code=") &&
        window.location.search.includes("state=")
      ) {
        const { appState } = await auth0Client.handleRedirectCallback();
        onRedirectCallback(appState);
      }

      const isAuthenticated = await auth0Client.isAuthenticated();

      setIsAuthenticated(isAuthenticated);

      if (isAuthenticated) {
        const user = await auth0Client.getUser();
        setUser(user);
      }

      setLoading(false);
    };
    initAuth0();
    // eslint-disable-next-line
  }, []);

  const loginWithPopup = async (params = {}) => {
    setPopupOpen(true);
    try {
      await auth0Client.loginWithPopup(params);
    } catch (error) {
      console.error(error);
    } finally {
      setPopupOpen(false);
    }
    const user = await auth0Client.getUser();
    setUser(user);
    setIsAuthenticated(true);
  };

  const handleRedirectCallback = async () => {
    setLoading(true);
    await auth0Client.handleRedirectCallback();
    const user = await auth0Client.getUser();
    setLoading(false);
    setIsAuthenticated(true);
    setUser(user);
  };

  // This hook is specific to our application and not derived from Auth0 example code
  useEffect(() => {
    async function updateStoredUser() {
      if (user !== undefined) {
        const savedUser = await getUser(user.sub);
        if (!savedUser) {
          // this is expected, as auth0 users predate this feature.
          // we can lazy-migrate them into our user database by
          // creating a record now.
          saveUser({
            name: user.name,
            email: user.email,
            auth0Id: user.sub,
          });
        } else {
          // if anything has changed, update our records.
          // this anoints Auth0 as the ultimate source of truth
          // for user info, synced at the beginning of a session
          if (
            !isEqualWith(
              savedUser,
              user,
              (a, b) => a.name === b.name && a.email === b.email,
            )
          ) {
            saveUser({
              ...savedUser,
              ...pick(user, ["email", "name"]),
            });
          }
        }
      }
    }
    updateStoredUser();
  }, [user]);

  return (
    <Auth0Context.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        popupOpen,
        loginWithPopup,
        handleRedirectCallback,
        getIdTokenClaims: (...p) => auth0Client.getIdTokenClaims(...p),
        loginWithRedirect: (...p) => auth0Client.loginWithRedirect(...p),
        getTokenSilently: (...p) => auth0Client.getTokenSilently(...p),
        getTokenWithPopup: (...p) => auth0Client.getTokenWithPopup(...p),
        logout: (...p) => auth0Client.logout(...p),
      }}
    >
      {children}
    </Auth0Context.Provider>
  );
};
