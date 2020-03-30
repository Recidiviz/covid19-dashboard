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

export default function generatePageContent(
  template: string,
  { title, location }: PageInfo,
) {
  let styleSheet = new ServerStyleSheet();
  let contentHtml = ReactDOMServer.renderToString(
    styleSheet.collectStyles(
      <StaticRouter location={location}>
        <App />
      </StaticRouter>,
    ),
  );
  const stylesHtml = styleSheet.getStyleTags();

  [
    ["TITLE PLACEHOLDER", title],
    ["<style></style>", stylesHtml],
    ["CONTENT PLACEHOLDER", contentHtml],
  ].map(([toFind, toReplace]) => {
    if (template.indexOf(toFind) === -1) {
      console.error(
        "\nERROR: " +
          `dist/index.html must include ${JSON.stringify(toFind)}. ` +
          "This string is used when generating static pages.",
      );
      process.exit(1);
    }
    template = template.replace(toFind, toReplace);
  });
  return template;
}
