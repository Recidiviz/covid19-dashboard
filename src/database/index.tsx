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

// As long as there is just one Auth0 config, this endpoint will work with any environment (local, prod, etc.).
const tokenExchangeEndpoint =
  "https://us-central1-c19-backend.cloudfunctions.net/getFirebaseToken";
const scenariosCollectionId = "scenarios";
const facilitiesCollectionId = "facilities";
const modelVersionCollectionId = "modelVersions";

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

if (typeof window !== "undefined") {
  firebase.initializeApp(firebaseConfig);
}

interface ModelInputVersionDocData extends EpidemicModelPersistent {
  observedAt: firebase.firestore.Timestamp;
  updatedAt: firebase.firestore.Timestamp;
}

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
  // Make sure the 'id' key doesn't exist on the entity object
  // or else Firestore won't permit the addition.
  delete entity.id;

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

  // We don't want to actually store the id as a field. It should only be used
  // as a Firestore document reference.  Note: we are intentionally calling
  // `delete payload.id` and not `delete entity.id` (like we do in
  // buildCreatePayload) because we do not want to mutate the entity object and
  // throw away the reference to its own id.
  delete payload.id;

  return payload;
};

const getBaselineScenarioRef = async (): Promise<firebase.firestore.DocumentReference | void> => {
  const db = await getDb();

  // Note: Firestore queries must only return documents that the user has access to. Otherwise, an error will be thrown.
  //       See https://firebase.google.com/docs/firestore/security/rules-conditions#rules_are_not_filters.
  const query = db
    .collection(scenariosCollectionId)
    .where(`roles.${currrentUserId()}`, "in", ["owner"])
    .where("baseline", "==", true);

  const results = await query.get();

  if (results.docs.length === 0) return;

  return results.docs[0].ref;
};

export const getBaselineScenario = async (): Promise<Scenario | null> => {
  const baselineScenarioRef = await getBaselineScenarioRef();

  if (!baselineScenarioRef) return null;

  const result = await baselineScenarioRef.get();
  let scenario: Scenario = result.data() as Scenario;
  scenario.id = baselineScenarioRef.id;

  return scenario;
};

const getScenarioRef = async (
  scenarioId: string,
): Promise<firebase.firestore.DocumentReference | void> => {
  try {
    const db = await getDb();

    const scenarioRef = await db
      .collection(scenariosCollectionId)
      .doc(scenarioId);

    return scenarioRef;
  } catch (error) {
    console.error(
      `Encountered error while attempting to retrieve the scenario ref (${scenarioId}):`,
    );
    console.error(error);
  }
};

export const getScenario = async (
  scenarioId: string,
): Promise<Scenario | null> => {
  try {
    const scenarioRef = await getScenarioRef(scenarioId);

    if (!scenarioRef) return null;

    const scenarioResult = await scenarioRef.get();
    const scenario = scenarioResult.data() as Scenario;
    scenario.id = scenarioResult.id;

    return scenario;
  } catch (error) {
    console.error(
      `Encountered error while attempting to retrieve the scenario (${scenarioId}):`,
    );
    console.error(error);

    return null;
  }
};

export const saveScenario = async (scenario: any): Promise<Scenario | null> => {
  try {
    const db = await getDb();
    let scenarioId;

    // If the scenario already has an id associated with it then we just need
    // to update that scenario. Otherwise, we are creating a new scenario.
    if (scenario.id) {
      const payload = buildUpdatePayload(scenario);

      await db
        .collection(scenariosCollectionId)
        .doc(scenario.id)
        .update(payload);

      scenarioId = scenario.id;
    } else {
      const userId = currrentUserId();
      const payload = buildCreatePayload(
        Object.assign({}, scenario, {
          roles: {
            // Automatically assign the logged-in user as the
            // "owner" of the scenario being saved.
            [userId]: "owner",
          },
        }),
      );

      const scenarioDocRef = await db
        .collection(scenariosCollectionId)
        .add(payload);

      scenarioId = scenarioDocRef.id;
    }

    return await getScenario(scenarioId);
  } catch (error) {
    console.error("Encountered error while attempting to save a scenario:");
    console.error(error);
    return null;
  }
};

export const getFacilities = async (
  scenarioId: string,
): Promise<Array<Facility> | null> => {
  try {
    const scenario = await getScenario(scenarioId);

    if (!scenario) return null;

    const db = await getDb();

    const facilitiesResults = await db
      .collection(scenariosCollectionId)
      .doc(scenario.id)
      .collection(facilitiesCollectionId)
      .orderBy("name")
      .get();

    const facilities = facilitiesResults.docs.map((doc) => {
      const facility = doc.data() as Facility;
      facility.id = doc.id;
      facility.scenarioId = scenario.id;
      return facility;
    });

    return facilities;
  } catch (error) {
    console.error("Encountered error while attempting to retrieve facilities:");

    console.error(error);

    return null;
  }
};

export const getFacilityModelVersions = async ({
  facilityId,
  scenarioId,
}: {
  facilityId: string;
  scenarioId: string;
}): Promise<ModelInputVersionDocData[]> => {
  const db = await getDb();

  try {
    const historyResults = await db
      .collection(scenariosCollectionId)
      .doc(scenarioId)
      .collection(facilitiesCollectionId)
      .doc(facilityId)
      .collection(modelVersionCollectionId)
      .orderBy("observedAt", "asc")
      .get();

    return historyResults.docs.map((doc) => {
      return doc.data() as ModelInputVersionDocData;
    });
  } catch (error) {
    console.error(
      "Encountered error while attempting to retrieve facility model versions:",
    );
    console.error(error);
    return [];
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
     "scenarioId": "<The Scenario's ID>",
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
     "scenarioId": "<The Scenario's ID>",
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
export const saveFacility = async (
  scenarioId: string,
  facility: any,
): Promise<void> => {
  try {
    const scenarioRef = await getScenarioRef(scenarioId);

    if (!scenarioRef) return;

    if (facility.modelInputs) {
      // Ensures we don't store any attributres that our model does not know
      // about. This also makes a copy of modelInputs, since we shouldn't mutate
      // the original.
      facility.modelInputs = pick(facility.modelInputs, persistedKeys);

      // Convert the dates in plannedReleases to strings. Otherwise, Firestore
      // will serialize these dates to timestamps in a way that is not
      // compatible with our date picker library. Instead, save these dates
      // values as strings in Firestore.
      // https://github.com/Recidiviz/covid19-dashboard/issues/144
      facility.modelInputs = JSON.parse(JSON.stringify(facility.modelInputs));

      facility.modelInputs.updatedAt = currrentTimestamp();

      // TODO: For now, this assumes we're always entering data as of "today"
      // However, in the near future, we should allow for a user submitted
      // observed at value.  If it is not provided default to today. For dates
      // observed in the past we'll have to assume the time portion of the
      // timestamp is startOfDay** since we won't otherwise have any time
      // information.
      //
      // ** https://date-fns.org/v1.29.0/docs/startOfDay
      facility.modelInputs.observedAt = new Date();
    }

    const db = await getDb();
    const batch = db.batch();

    const facilitiesCollection = scenarioRef.collection(facilitiesCollectionId);

    let facilityDoc;

    // If the facility already has an id associated with it then
    // we just need to update that facility. Otherwise, we are
    // appending a new facility to the scenario's facilities
    // collection.
    if (facility.id) {
      const payload = buildUpdatePayload(facility);
      facilityDoc = facilitiesCollection.doc(facility.id);
      batch.update(facilityDoc, payload);
    } else {
      const payload = buildCreatePayload(facility);
      facilityDoc = facilitiesCollection.doc();
      batch.set(facilityDoc, payload);
    }

    // If the facility's model inputs have been provided, store a new
    // versioned copy of those inputs.
    if (facility.modelInputs) {
      const newModelVersionDoc = facilityDoc
        .collection(modelVersionCollectionId)
        .doc();

      batch.set(newModelVersionDoc, facility.modelInputs);
    }

    await batch.commit();
  } catch (error) {
    console.error("Encountered error while attempting to save a facility:");
    console.error(error);
  }
};

export const deleteFacility = async (
  scenarioId: string,
  facilityId: string,
): Promise<void> => {
  try {
    const scenarioRef = await getScenarioRef(scenarioId);

    if (!scenarioRef) return;

    // Delete all of the modelVersions associated with a facility.  Technically,
    // this is not the recommended approach for the web*, but we should be ok
    // while our datasets are small.  In the future, we can address this issue
    // if it becomes problematic**.
    //
    // * https://firebase.google.com/docs/firestore/manage-data/delete-data#web_2
    // ** https://github.com/Recidiviz/covid19-dashboard/issues/191
    const facilityDocRef = await scenarioRef
      .collection(facilitiesCollectionId)
      .doc(facilityId);

    const modelVersions = await facilityDocRef
      .collection(modelVersionCollectionId)
      .get();

    const db = await getDb();
    const batch = db.batch();

    modelVersions.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    batch.delete(facilityDocRef);

    await batch.commit();
  } catch (error) {
    console.error(
      `Encountered error while attempting to delete the facility (${facilityId}):`,
    );
    console.error(error);
  }
};
