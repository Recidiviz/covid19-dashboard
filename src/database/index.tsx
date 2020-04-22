// the core Firebase SDK must be imported before other Firebase modules
// eslint-disable-next-line simple-import-sort/sort
import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

import createAuth0Client from "@auth0/auth0-spa-js";
import { pick } from "lodash";

import config from "../auth/auth_config.json";
import {
  EpidemicModelPersistent,
  persistedKeys,
} from "../impact-dashboard/EpidemicModelContext";
import { Facility, Scenario } from "../page-multi-facility/types";
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

const buildCreatePayload = (entity: any) => {
  const timestamp = currrentTimestamp();
  return Object.assign({}, entity, {
    createdAt: timestamp,
    updatedAt: timestamp,
  });
};

const buildUpdatePayload = (entity: any) => {
  const timestamp = currrentTimestamp();
  const payload = Object.assign({}, entity, {
    updatedAt: timestamp,
  });

  // We don't want to actually store the id as a field. It should
  // only be used as a Firestore document reference.
  delete payload.id;

  return payload;
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

  // Note: Firestore queries must only return documents that the user has access to. Otherwise, an error will be thrown.
  //       See https://firebase.google.com/docs/firestore/security/rules-conditions#rules_are_not_filters.
  const query = db
    .collection(scenariosCollectionId)
    .where(`roles.${currrentUserId()}`, "in", ["owner"])
    .where("baseline", "==", true);

  const results = await query.get();

  if (results.docs.length === 0) return null;

  return results.docs[0].ref;
};

export const saveScenario = async (scenario: {}): Promise<void> => {
  try {
    // We're cheating here because for the launch we know there is only a
    // baseline scenario. In subsequent launches, we'll need to pass in
    // the ID of the specific scenario that we want to save. See:
    // https://github.com/Recidiviz/covid19-dashboard/issues/129
    const baselineScenarioRef = await getBaselineScenarioRef();

    if (!baselineScenarioRef) return;

    const payload = buildUpdatePayload(scenario);

    return await baselineScenarioRef.update(payload);
  } catch (error) {
    console.error("Encountered an error while saving the scenario:");
    console.error(error);
  }
};

export const getBaselineScenario = async (
  baselineScenarioRef: firebase.firestore.DocumentReference | null,
) => {
  if (!baselineScenarioRef) return null;

  const result = await baselineScenarioRef.get();
  let scenario: Scenario = result.data() as Scenario;

  if (scenario && !scenario.hasOwnProperty("promoStatuses")) {
    scenario = {
      ...scenario,
      promoStatuses: {
        dataSharing: true,
        dailyReports: true,
        addFacilities: true,
      },
    };
    await saveScenario(scenario);
  }
  return scenario;
};

export const createBaselineScenario = async () => {
  try {
    let baselineScenarioRef = await getBaselineScenarioRef();

    if (baselineScenarioRef) {
      return baselineScenarioRef;
    }

    const userId = currrentUserId();

    const db = await getDb();

    const payload = buildCreatePayload({
      name: "Baseline Scenario",
      baseline: true,
      dataSharing: false,
      dailyReports: false,
      promoStatuses: {
        dataSharing: true,
        dailyReports: true,
        addFacilities: true,
      },
      description:
        "Welcome to your new scenario. To get started, add in facility data on the right-hand side of the page. Your initial scenario is also your 'Baseline' - meaning this is where you should keep real-world numbers about the current state of your facilities, their cases, and mitigation steps.",
      roles: {
        [userId]: "owner",
      },
    });

    baselineScenarioRef = await db
      .collection(scenariosCollectionId)
      .add(payload);

    return baselineScenarioRef;
  } catch (error) {
    console.error("Encountered an error while creating the baseline scenario:");
    console.error(error);
    return null;
  }
};

export const getFacilities = async (): Promise<Array<Facility> | null> => {
  try {
    // Cheating for launch expediency.
    // See: https://github.com/Recidiviz/covid19-dashboard/issues/129
    const baselineScenarioRef = await getBaselineScenarioRef();

    if (!baselineScenarioRef) return null;

    const facilitiesResults = await baselineScenarioRef
      .collection(facilitiesCollectionId)
      .orderBy("name")
      .get();

    const facilities = facilitiesResults.docs.map((doc) => {
      const facility = doc.data() as Facility;
      facility.id = doc.id;
      return facility;
    });

    return facilities;
  } catch (error) {
    console.error("Encountered error while attempting to retrieve facilities:");

    console.error(error);

    return null;
  }
};

export const getFacility = async (
  facilityId: string,
): Promise<Facility | null> => {
  try {
    // Cheating for launch expediency.
    // See: https://github.com/Recidiviz/covid19-dashboard/issues/129
    const baselineScenarioRef = await getBaselineScenarioRef();

    if (!baselineScenarioRef) return null;

    const facilityResult = await baselineScenarioRef
      .collection(facilitiesCollectionId)
      .doc(facilityId)
      .get();

    const facility = facilityResult.data() as Facility;
    facility.id = facilityResult.id;

    return facility;
  } catch (error) {
    console.error(
      `Encountered error while attempting to retrieve the facility (${facilityId}):`,
    );

    console.error(error);

    return null;
  }
};

/**
 * Please note the following usage patterns and provide data to this method
 * accordingly when updating a facility:
 *
 * At the facility's "root" level you can update fields in a "shallow"
 * manner. For example, you can update a Facilty's name as follows without
 * affecting any other fields:
 *
 * saveFacility({
 *   "id": "<The Faciliy's ID>",
 *   "name": "Updated Facility Name",
 * });
 *
 * However, when updating modelInput fields you must provide ALL of the
 * relevant fields for the model that you'd like to save.  In other words,
 * you can't update a single model input field as follows:
 *
 * // Don't do this, it will erase all other model input aside from the
 * // ageUnknownCases:
 * saveFacility({
 *   "id": "<The Faciliy's ID>",
 *   "modelInput": {
 *     "ageUnknownCases": 4
 *   }
 * });
 *
 * Instead, when saving model inputs, you'll need to pass in the full
 * list of attributes that you are interested in saving as defined by
 * the type EpidemicModelPersistent found in the EpidemicModelContext.
 *
 * This might seem annoying but in practice isn't that big of a deal
 * because the submission from the web form will include all of the model
 * input fields that the user wishes to store.
 *
 * Note: It is fine to leave model input values out of modelInputs field
 * if the desired behavior is that those fields are deleted from Firestore.
 */
export const saveFacility = async (facility: any): Promise<void> => {
  try {
    // We're cheating here because for the launch we know there is only a
    // baseline scenario. In subsequent launches, we'll need to pass in
    // the ID of the specific scenario that we want to save the facility to.
    // See: https://github.com/Recidiviz/covid19-dashboard/issues/129
    const baselineScenarioRef = await getBaselineScenarioRef();

    if (!baselineScenarioRef) return;

    if (facility.modelInputs) {
      // Ensures we don't store any attributres that our model does not
      // know about.
      facility.modelInputs = pick(facility.modelInputs, persistedKeys);
    }

    // If the facility already has an id associated with it then
    // we just need to update that facility. Otherwise, we are
    // appending a new facility to the scenario's facilities
    // collection.
    if (facility.id) {
      const payload = buildUpdatePayload(facility);

      baselineScenarioRef
        .collection(facilitiesCollectionId)
        .doc(facility.id)
        .update(payload);
    } else {
      // Make sure this key doesn't exist on the facility object
      // or else Firestore won't permit the addition.
      delete facility.id;

      const payload = buildCreatePayload(facility);

      baselineScenarioRef.collection(facilitiesCollectionId).add(payload);
    }
  } catch (error) {
    console.error("Encountered error while attempting to save a facility:");
    console.error(error);
  }
};

export const deleteFacility = async (facilityId: string): Promise<void> => {
  try {
    // Cheating for launch expediency.
    // See: https://github.com/Recidiviz/covid19-dashboard/issues/129
    const baselineScenarioRef = await getBaselineScenarioRef();

    if (!baselineScenarioRef) return;

    await baselineScenarioRef
      .collection(facilitiesCollectionId)
      .doc(facilityId)
      .delete();
  } catch (error) {
    console.error(
      `Encountered error while attempting to delete the facility (${facilityId}):`,
    );
    console.error(error);
  }
};
