import * as firebase from "firebase";
import "firebase/auth";
import "firebase/database";
import { pickBy } from "lodash";

import createAuth0Client from "@auth0/auth0-spa-js";

import config from "../auth/auth_config.json";
import { EpidemicModelUpdate } from '../impact-dashboard/EpidemicModelContext';

// As long as there is just one Auth0 config, this endpoint will work with any environment (local, prod, etc.).
const tokenExchangeEndpoint =
  "https://us-central1-c19-backend.cloudfunctions.net/getFirebaseToken";
const modelInputsCollectionId = "model_inputs";

// Note: None of these are secrets.
let firebaseConfig = {
  apiKey: "AIzaSyDbZSkjnfP7mt4W_aDqMKHJizsiQB1yCEw",
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

const getInputModelsDocRef = async () => {
  await authenticate();

  if (!firebase.auth().currentUser) {
    throw new Error(
      "Firebase user unexpectedly not set",
    );
  }

  const db = firebase.firestore();
  return db
    .collection(modelInputsCollectionId)
    .doc((firebase.auth().currentUser || {}).uid);
};

// TODO: Guard against the possibility of autosaves completing out of order.
export const saveState = async (persistedState: object): Promise<void> => {
  try {
    const docRef = await getInputModelsDocRef();

    if (!docRef) return;

    docRef.set({
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      inputs: {
        // keys set to undefined aren't useful to store
        0: pickBy(persistedState, (value) => value !== undefined),
      },
    });
  } catch (error) {
    console.error("Encountered error while attempting to save:");
    console.error(error);
  }
};

export const getSavedState = async (): Promise<EpidemicModelUpdate> => {
  try {
    const docRef = await getInputModelsDocRef();

    if (!docRef) return {};

    const doc = await docRef.get();

    if (!doc.exists) return {};

    const data = doc.data();

    return !data || !data.inputs || !data.inputs[0] ? null : data.inputs[0];
  } catch (error) {
    console.error(
      "Encountered error while attempting to retrieve saved state:",
    );
    console.error(error);

    return {};
  }
};
