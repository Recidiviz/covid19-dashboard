/**
 * Provides endpoint for exchanging an Auth0 token for a Firebase custom auth token that can be used to silently sign
 * the user in in the Firebase sense.
 *
 * Mostly copied from
 * https://github.com/auth0-blog/firestore-web-chat/blob/beeae4a01c998aaefa5d567c318b394795caa939/src/server.js
 */
const express = require("express");
const cors = require("cors");
const firebaseAdmin = require("firebase-admin");
const functions = require("firebase-functions");
const jwt = require("express-jwt");
const jwks = require("jwks-rsa");
const fetch = require("node-fetch");

const serviceAccount = functions.config().service_account;
const auth0Config = functions.config().auth0;

const app = express();
app.use(cors());

const jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${auth0Config.domain}/.well-known/jwks.json`,
  }),
  audience: auth0Config.audience,
  issuer: `https://${auth0Config.domain}/`,
  algorithm: "RS256",
});

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
});

app.post("/", jwtCheck, async (req, res) => {
  const { sub: uid } = req.user;

  try {
    const firebaseToken = await firebaseAdmin.auth().createCustomToken(uid);
    res.json({ firebaseToken });
  } catch (err) {
    res.status(500).send({
      message: "Something went wrong acquiring a Firebase token.",
      error: err,
    });
  }
});

exports.getFirebaseToken = functions.https.onRequest(app);

exports.getLocaleData = functions.https.onRequest(async (request, response) => {
  const csvResponse = await fetch(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSeEO7JySaN21_Cxa7ON_x" +
      "UHDM-EEOFSMIjOAoLf6YOXBurMRXZYPFi7x_aOe-0awqDcL4KZTK1NhVI/pub?gid=" +
      "1836987932&single=true&output=csv",
  );
  response.header("Content-Type", "text/csv");
  response.header("Access-Control-Allow-Origin", "*");
  response.attachment("locale-data.csv");
  response.send(await csvResponse.text());
});
