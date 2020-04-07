// @ts-nocheck
/* eslint-disable */

// We want build.tsx to support source maps. This means that even after
// compiling it to build.js, we want to know the .tsx file trackback for runtime
// errors.

// We use Parcel to compile build.tsx to build.js. Parcel supports source maps,
// but it supports browser-style paths, not Node-style paths. Two things that
// are different about these styles:
//
// 1. The source map URL is wrong. The source map URL should point to
//    ./build.js.map, not /build.js.map. Without this fixed, source maps don't
//    work at all. THIS SCRIPT FIXES THIS ISSUE.
//
// 2. The paths of all the .tsx files are relative to the wrong directory. THIS
//    SCRIPT DOES NOT FIX THIS ISSUE, but it most cases it's very easy to figure
//    out which actual file is causing the error. For example:
//
//        TypeError: Cannot read property 'loading' of undefined
//        at d (dist/build.js:76:511)
//            -> src/entry-point-static../entry-point-client/App.tsx:13:11
//
//    Obviously the issue is in src/entry-point-client/App.tsx:13:11.

const fs = require("fs");

let contents = fs.readFileSync("dist/build.js", "utf-8");
contents = contents.replace("=/build.js.map", "=./build.js.map");
fs.writeFileSync("dist/build.js", contents, "utf-8");
