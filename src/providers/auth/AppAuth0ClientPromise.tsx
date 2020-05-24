import createAuth0Client from "@auth0/auth0-spa-js";
import Auth0Client from "@auth0/auth0-spa-js/dist/typings/Auth0Client";

import staticAuthConfig from "./auth_config.json";

let redirectUri =
  // Note: The window variable is not defined static rendering.
  typeof window === "undefined" ? undefined : window.location.origin;

const finalAuthConfig = {
  domain: staticAuthConfig.domain,
  // eslint-disable-next-line @typescript-eslint/camelcase
  client_id: staticAuthConfig.clientId,
  audience: staticAuthConfig.audience,
  // eslint-disable-next-line @typescript-eslint/camelcase
  redirect_uri: redirectUri,
};

/**
 * A Promise that resolves to an Auth0 client for this app. This is intended to
 * be used as a global variable -- all users of this variable will see the same
 * instance, which makes sure that we only make one network request to check the
 * auth status.
 *
 * Creating the Auth0 client was originally done in
 * src/auth/react-auth0-spa.tsx, but the non-React-aware code in
 * src/database/index.tsx needs access to this client as well.
 *
 * TODO: Refactor the database code to accept an Auth0 client, or something like
 * that.
 */
const AppAuth0ClientPromise: Promise<Auth0Client> =
  // Note: The window variable is not defined static rendering.
  typeof window === "undefined"
    ? new Promise(() => undefined)
    : createAuth0Client(finalAuthConfig);

export default AppAuth0ClientPromise;
