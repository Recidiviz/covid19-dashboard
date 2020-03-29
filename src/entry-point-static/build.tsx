import chalk from "chalk";
import fs from "fs";
import path from "path";

import generatePageContent, { PageInfo } from "./generatePageContent";

let pageInfos: PageInfo[] = [
  { title: "Recidiviz COVID-19 Dashboard", location: "/" },
  { title: "Test Page", location: "/test" },
];

console.log(chalk.blueBright("Rendering React statically into HTML files:"));

for (let pageInfo of pageInfos) {
  let dirPath = path.join("dist", pageInfo.location);
  let filePath = path.join(dirPath, "index.html");

  console.log(chalk.blueBright(`Writing: ${filePath}`));

  let html = generatePageContent(pageInfo);
  fs.mkdirSync(dirPath, { recursive: true });
  fs.writeFileSync(filePath, html);
}
