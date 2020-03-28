import React from "react";
import ReactDOM from "react-dom";

import App from "./App";

(window as any).React = React;

ReactDOM.render(<App />, document.getElementById("app"));
