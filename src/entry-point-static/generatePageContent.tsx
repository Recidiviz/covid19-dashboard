import fs from "fs";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { ServerStyleSheet } from "styled-components";

import App from "../entry-point-client/App";

(global as any).React = React;

export interface PageInfo {
  title: string;
  location: string;
}
export default function generatePageContent({ title, location }: PageInfo) {
  let styleSheet = new ServerStyleSheet();
  let contentHtml = ReactDOMServer.renderToString(
    styleSheet.collectStyles(
      <StaticRouter location={location}>
        <App />
      </StaticRouter>,
    ),
  );
  const stylesHtml = styleSheet.getStyleTags();
  let template = fs.readFileSync("dist/index.html", "utf-8");
  template = template.replace("TITLE GOES HERE", title);
  template = template.replace("<style></style>", stylesHtml);
  template = template.replace("CONTENT GOES HERE", contentHtml);
  return template;
}
