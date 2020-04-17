// the core Firebase SDK must be imported before other Firebase modules
// eslint-disable-next-line simple-import-sort/sort
import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

import createAuth0Client from "@auth0/auth0-spa-js";

import config from "../auth/auth_config.json";
import { EpidemicModelPersistent } from "../impact-dashboard/EpidemicModelContext";
import { Facility } from "../page-multi-facility/types";
import { prepareForStorage, prepareFromStorage } from "./utils";

// As long as there is just one Auth0 config, this endpoint will work with any environment (local, prod, etc.).
const tokenExchangeEndpoint =
  "https://us-central1-c19-backend.cloudfunctions.net/getFirebaseToken";
const modelInputsCollectionId = "model_inputs";
const scenariosCollectionId = "scenarios";
const facilitiesCollectionId = "facilities";

// Note: None of these are secrets.
let firebaseConfig = {
  apiKey: "AIzaSyDdCp7P-oncmuRpMtpxdb5M0nXq6U3qU7A",
  authDomain: "c19-backend.firebaseapp.com",
  databaseURL: "https://c19-backend.firebaseio.com",
  projectId: "c19-backend",
  storageBucket: "c19-backend.appspot.com",
  messagingSenderId: "508068404480",
  appId: "1:508068404480:web:65bfe28b619e1ad572e7e5",
};

firebase.initializeApp(firebaseConfig);

/**
 * Silently authenticates the user to Firebase if possible.
 */
const authenticate = async () => {
  // TODO: Error handling.
  if (firebase.auth().currentUser) return;

  const rekeyedConfig = {
    domain: config.domain,
    // eslint-disable-next-line @typescript-eslint/camelcase
    client_id: config.clientId,
    audience: config.audience,
  };

  const auth0Token = await (
    await createAuth0Client(rekeyedConfig)
  ).getTokenSilently();

  const tokenExchangeResponse = await fetch(tokenExchangeEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${auth0Token}`,
    },
  });

  const { firebaseToken: customToken } = await tokenExchangeResponse.json();

  await firebase.auth().signInWithCustomToken(customToken);
};

const currrentUserId = () => {
  const userId = (firebase.auth().currentUser || {}).uid;

  if (!userId) {
    throw new Error("currrentUserId() always expects a user to be returned");
  }

  return userId;
};

const currrentTimestamp = () => {
  return firebase.firestore.FieldValue.serverTimestamp();
};

const getDb = async () => {
  await authenticate();

  if (!firebase.auth().currentUser) {
    throw new Error("Firebase user unexpectedly not set");
  }

  return firebase.firestore();
};

const getInputModelsDocRef = async () => {
  const db = await getDb();
  return db.collection(modelInputsCollectionId).doc(currrentUserId());
};

// TODO: Guard against the possibility of autosaves completing out of order.
export const saveState = async (
  persistedState: EpidemicModelPersistent,
): Promise<void> => {
  try {
    const docRef = await getInputModelsDocRef();

    if (!docRef) return;

    docRef.set({
      timestamp: currrentTimestamp(),
      inputs: prepareForStorage(persistedState),
    });
  } catch (error) {
    console.error("Encountered error while attempting to save:");
    console.error(error);
  }
};

export const getSavedState = async (): Promise<EpidemicModelPersistent | null> => {
  try {
    const docRef = await getInputModelsDocRef();

    if (!docRef) return null;

    const doc = await docRef.get();

    if (!doc.exists) return null;

    const data = doc.data();

    return !data || !data.inputs ? null : prepareFromStorage(data.inputs);
  } catch (error) {
    console.error(
      "Encountered error while attempting to retrieve saved state:",
    );
    console.error(error);

    return null;
  }
};

export const getBaselineScenarioRef = async () => {
  const db = await getDb();

  const query = db
    .collection(scenariosCollectionId)
    .where("baseline", "==", true);

  const results = await query.get();
  const userId = currrentUserId();

  const baselineScenario = results.docs.find((doc) => {
    const scenario = doc.data();
    return scenario.roles[userId] == "owner";
  });

  if (!baselineScenario) return null;

  return baselineScenario.ref;
};

export const getFacilities = async (): Promise<Array<Facility> | null> => {
  try {
    const baselineScenarioRef = await getBaselineScenarioRef();

    if (!baselineScenarioRef) return null;

    const facilitiesResults = await baselineScenarioRef
      .collection(facilitiesCollectionId)
      .get();

    const facilities = facilitiesResults.docs.map(
      (doc) => doc.data() as Facility,
    );

    return facilities;
  } catch (error) {
    console.error("Encountered error while attempting to retrieve facilities:");

    console.error(error);

    return null;
  }
};

export const createBaselineScenario = async () => {
  try {
    let baselineScenarioRef = await getBaselineScenarioRef();

    if (baselineScenarioRef) {
      return baselineScenarioRef;
    }

    const userId = currrentUserId();
    const timestamp = currrentTimestamp();

    const db = await getDb();

    baselineScenarioRef = await db.collection(scenariosCollectionId).add({
      name: "Baseline Scenario",
      baseline: true,
      roles: {
        [userId]: "owner",
      },
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return baselineScenarioRef;
  } catch (error) {
    console.error("Encountered an error while creating the baseline scenario:");
    console.error(error);
    return null;
  }
};

export const saveScenario = async (scenario: {}): Promise<void> => {
  try {
    // We're cheating here because for the launch we know there is only a
    // baseline scenario. In subsequent launches, we'll need to pass in
    // the ID of the specific scenario that we want to save. See:
    // https://github.com/Recidiviz/covid19-dashboard/issues/129
    const baselineScenarioRef = await getBaselineScenarioRef();

    if (!baselineScenarioRef) return;

    const payload = Object.assign({}, scenario, {
      updatedAt: currrentTimestamp(),
    });

    baselineScenarioRef.update(payload);
  } catch (error) {
    console.error("Encountered an error while saving the scenario:");
    console.error(error);
  }
};
