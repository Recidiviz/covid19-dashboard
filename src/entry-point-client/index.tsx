import '@babel/polyfill';

import React from "react";
(window as any).React = React;

import ReactDOM from "react-dom";
import { Router } from "react-router-dom";

import App from "./App";

import * as serviceWorker from "../serviceWorker";
import { Auth0Provider } from "../react-auth0-spa";
import config from "../auth_config.json";
import history from "../utils/history";

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

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
