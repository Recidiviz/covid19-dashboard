import ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { ServerStyleSheet } from "styled-components";

import App from "../entry-point-client/App";
import { PageInfo } from "../entry-point-client/PageList";

export default function generatePageContent(
  template: string,
  { title, path }: PageInfo,
) {
  let styleSheet = new ServerStyleSheet();
  let contentHtml = ReactDOMServer.renderToString(
    styleSheet.collectStyles(
      <StaticRouter location={path}>
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
