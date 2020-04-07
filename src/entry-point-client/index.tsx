import '@babel/polyfill';

import React from "react";
(window as any).React = React;

import ReactDOM from "react-dom";
import { Router } from "react-router-dom";

import App from "./App";

import { Auth0Provider } from "../auth/react-auth0-spa";
import config from "../auth/auth_config.json";
import history from "./history";

// A function that routes the user to the right place
// after login
const onRedirectCallback = appState => {
  history.push(
    appState && appState.targetUrl
      ? appState.targetUrl
      : window.location.pathname
  );
};

let element = (
  <Auth0Provider
    domain={config.domain}
    client_id={config.clientId}
    audience={config.audience}
    redirect_uri={window.location.origin}
    onRedirectCallback={onRedirectCallback}
  >
    <Router history={history}>
      <App />
    </Router>
  </Auth0Provider>
);

let container = document.getElementById("app");

if (process.env.NODE_ENV === "development") {
  ReactDOM.render(element, container);
} else {
  ReactDOM.hydrate(element, container);
}
