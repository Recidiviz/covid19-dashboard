import React from "react";
(global as any).React = React;

import chalk from "chalk";
import fs from "fs";
import path from "path";

import PageList from "../entry-point-client/PageList";
import generatePageContent from "./generatePageContent";

console.log(chalk.blueBright("Rendering React statically into HTML files:"));

let template = fs.readFileSync("dist/index.html", "utf-8");
for (let pageInfo of PageList) {
  let dirPath = path.join("dist", pageInfo.path);
  let filePath = path.join(dirPath, "index.html");

  console.log(chalk.blueBright(`Writing: ${filePath}`));

  let html = generatePageContent(template, pageInfo);
  fs.mkdirSync(dirPath, { recursive: true });
  fs.writeFileSync(filePath, html);
}
