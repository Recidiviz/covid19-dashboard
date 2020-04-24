// Some libraries, including semiotic, assume the global variable `self` is
// defined. This is true in the browser but not when running Parcel from Node.
(global as any).self = global;

import chalk from "chalk";
import fs from "fs";
import path from "path";

import PageList, { PageInfo } from "../entry-point-client/PageList";
import generatePageContent from "./generatePageContent";

console.log(chalk.blueBright("Rendering React statically into HTML files:"));

const generatePage = (template: string, pageInfo: PageInfo) => {
  let dirPath = path.join("dist", pageInfo.path);
  let filePath = path.join(dirPath, "index.html");

  console.log(chalk.blueBright(`Writing: ${filePath}`));

  let html = generatePageContent(template, pageInfo);
  fs.mkdirSync(dirPath, { recursive: true });
  fs.writeFileSync(filePath, html);
};

let template = fs.readFileSync("dist/index.html", "utf-8");
for (let pageInfo of PageList) {
  generatePage(template, pageInfo);
}
