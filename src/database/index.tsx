// the core Firebase SDK must be imported before other Firebase modules
// eslint-disable-next-line simple-import-sort/sort
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

import {
  format,
  startOfDay,
  differenceInCalendarDays,
  isSameDay,
  isEqual,
} from "date-fns";
import {
  pick,
  orderBy,
  uniqBy,
  findKey,
  maxBy,
  minBy,
  pickBy,
  omitBy,
  isUndefined,
} from "lodash";
import { Optional } from "utility-types";

import { MMMMdyyyy } from "../constants";
import { persistedKeys } from "../impact-dashboard/EpidemicModelContext";
import {
  Facility,
  ModelInputs,
  Scenario,
  ScenarioUsers,
  User,
} from "../page-multi-facility/types";
import {
  buildFacility,
  buildModelInputs,
  buildScenario,
  buildUser,
  buildReferenceFacility,
  buildFacilityDocUpdate,
} from "./type-transforms";
import AppAuth0ClientPromise from "../auth/AppAuth0ClientPromise";
import { ascending, zip } from "d3-array";
import { validateCumulativeCases } from "../infection-model/validators";
import { ModelInputsUpdate } from "./types";

// As long as there is just one Auth0 config, this endpoint will work with any environment (local, prod, etc.).
const tokenExchangeEndpoint =
  "https://us-central1-c19-backend.cloudfunctions.net/getFirebaseToken";
const scenariosCollectionId = "scenarios";
const facilitiesCollectionId = "facilities";
const modelVersionCollectionId = "modelVersions";
const usersCollectionId = "users";
// TODO (#521): when the datasource stabilizes, change this to the real collection
const referenceFacilitiesCollectionId = "reference_facilities_test";
const referenceFacilitiesCovidCasesCollectionId = "covidCases";
// TODO (#521): when we switch to using the real data update this property for the scenario
export const referenceFacilitiesProp = "testReferenceFacilities";

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

// Only call firebase.initializeApp if we're in the browser and not during
// static render (it doesn't work).
if (typeof window !== "undefined") {
  firebase.initializeApp(firebaseConfig);
}

/**
 * Silently authenticates the user to Firebase if possible.
 */
const authenticate = async () => {
  // TODO: Error handling.
  if (firebase.auth().currentUser) return;

  let auth0Client = await AppAuth0ClientPromise;
  const auth0Token = await auth0Client.getTokenSilently();

  const tokenExchangeResponse = await fetch(tokenExchangeEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${auth0Token}`,
    },
  });

  const { firebaseToken: customToken } = await tokenExchangeResponse.json();

  await firebase.auth().signInWithCustomToken(customToken);
};

const currentUserId = () => {
  const userId = (firebase.auth().currentUser || {}).uid;

  if (!userId) {
    throw new Error("currentUserId() always expects a user to be returned");
  }

  return userId;
};

const currentTimestamp = () => {
  return firebase.firestore.FieldValue.serverTimestamp();
};

const getDb = async () => {
  await authenticate();

  if (!firebase.auth().currentUser) {
    throw new Error("Firebase user unexpectedly not set");
  }

  return firebase.firestore();
};

const buildCreatePayload = <T,>(entity: T): T => {
  // Make sure the 'id' key doesn't exist on the entity object
  // or else Firestore won't permit the addition.
  delete (entity as any).id;

  // remove any keys that are explicitly set to undefined or Firestore will object
  const filteredEntity: any = omitBy(entity, isUndefined);

  const timestamp = currentTimestamp();
  return Object.assign({}, filteredEntity, {
    createdAt: timestamp,
    updatedAt: timestamp,
  });
};

const buildUpdatePayload = <T,>(entity: T): T => {
  // remove any keys that are explicitly set to undefined or Firestore will object
  const filteredEntity: any = omitBy(entity, isUndefined);

  const timestamp = currentTimestamp();
  const payload = Object.assign({}, filteredEntity, {
    updatedAt: timestamp,
  });

  // We don't want to actually store the id as a field. It should only be used
  // as a Firestore document reference.  Note: we are intentionally calling
  // `delete payload.id` and not `delete entity.id` (like we do in
  // buildCreatePayload) because we do not want to mutate the entity object and
  // throw away the reference to its own id.
  delete (payload as any).id;

  return payload;
};

function throwIfPermissionsError(
  error: { code?: string; message: string },
  message: string,
) {
  if (error.code === "permission-denied") {
    error.message = message;
  }
  throw error;
}

export const SCENARIO_DEFAULTS = {
  baseline: false,
  dailyReports: false,
  dataSharing: false,
  useReferenceData: false,
  promoStatuses: {},
  baselinePopulations: [],
  [referenceFacilitiesProp]: {},
};

const getBaselineScenarioRef = async (): Promise<firebase.firestore.DocumentReference | void> => {
  const db = await getDb();

  // Note: Firestore queries must only return documents that the user has access to. Otherwise, an error will be thrown.
  //       See https://firebase.google.com/docs/firestore/security/rules-conditions#rules_are_not_filters.
  const query = db
    .collection(scenariosCollectionId)
    .where(`roles.${currentUserId()}`, "in", ["owner"])
    .where("baseline", "==", true);

  const results = await query.get();

  if (results.docs.length === 0) return;

  return results.docs[0].ref;
};

export const getBaselineScenario = async (): Promise<Scenario | null> => {
  const baselineScenarioRef = await getBaselineScenarioRef();

  if (!baselineScenarioRef) return null;

  const result = await baselineScenarioRef.get();
  return buildScenario(result);
};

const getScenarioRef = async (
  scenarioId: string,
): Promise<firebase.firestore.DocumentReference | void> => {
  try {
    const db = await getDb();

    const scenarioRef = db.collection(scenariosCollectionId).doc(scenarioId);

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

    return buildScenario(scenarioResult);
  } catch (error) {
    console.error(
      `Encountered error while attempting to retrieve the scenario (${scenarioId}):`,
    );
    console.error(error);
    throwIfPermissionsError(
      error,
      "You don't have permission to access this scenario.",
    );

    return null;
  }
};

export const getScenarios = async (): Promise<Scenario[]> => {
  try {
    const db = await getDb();

    const scenarioResults = await db
      .collection(scenariosCollectionId)
      .where(`roles.${currentUserId()}`, "in", ["owner", "viewer"])
      .get();

    const scenarios = scenarioResults.docs.map((doc) => {
      return buildScenario(doc);
    });

    // We're sorting in memory instead of in the query above due to a limitation
    // in the way our data is currently modeled. See this issue for more details:
    // https://github.com/Recidiviz/covid19-dashboard/issues/253
    return orderBy(
      scenarios,
      ["baseline", (scenario) => scenario.name.toLowerCase()],
      ["desc", "asc"],
    );
  } catch (error) {
    console.error(`Encountered error while attempting to retrieve scenarios:`);
    console.error(error);

    return [];
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
      const userId = currentUserId();
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
    // known errors should be rethrown for handling;
    // anything else gets logged and swallowed
    console.error("Encountered error while attempting to save a scenario:");
    console.error(error);
    throwIfPermissionsError(
      error,
      "You don't have permission to edit this scenario.",
    );
    return null;
  }
};

const getFacilityModelVersions = async ({
  facilityId,
  scenarioId,
  distinctByObservedAt = false,
}: {
  facilityId: string;
  scenarioId: string;
  distinctByObservedAt?: boolean;
}): Promise<ModelInputs[]> => {
  const db = await getDb();

  try {
    const historyResults = await db
      .collection(scenariosCollectionId)
      .doc(scenarioId)
      .collection(facilitiesCollectionId)
      .doc(facilityId)
      .collection(modelVersionCollectionId)
      .orderBy("observedAt", "asc")
      .orderBy("updatedAt", "desc")
      .get();

    let modelVersions = historyResults.docs.map((doc) =>
      buildModelInputs(doc.data()),
    );
    if (distinctByObservedAt) {
      // if observedAt has not been normalized,
      // we have to re-sort in memory to properly group by observedAt
      let normalized = !modelVersions.some((version, index) => {
        if (!index) return;

        const { observedAt } = version;
        const { observedAt: prevObservedAt } = modelVersions[index - 1];
        return (
          isSameDay(observedAt, prevObservedAt) &&
          !isEqual(observedAt, prevObservedAt)
        );
      });
      if (!normalized) {
        modelVersions = orderBy(
          modelVersions,
          [(version) => version.observedAt.toDateString(), "updatedAt"],
          ["asc", "desc"],
        );
      }
      return uniqBy(
        modelVersions,
        // make sure time doesn't enter into the uniqueness
        (record) => record.observedAt.toDateString(),
      );
    } else {
      return modelVersions;
    }
  } catch (error) {
    console.error(
      "Encountered error while attempting to retrieve facility model versions:",
    );
    console.error(error);
    throwIfPermissionsError(
      error,
      "You don't have permission to access this facility's history.",
    );
    return [];
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

    return Promise.all(
      facilitiesResults.docs.map(async (doc) => {
        const modelVersions = await getFacilityModelVersions({
          scenarioId: scenarioId,
          facilityId: doc.id,
          distinctByObservedAt: true,
        });
        return buildFacility(scenario.id, doc, modelVersions);
      }),
    );
  } catch (error) {
    console.error("Encountered error while attempting to retrieve facilities:");
    console.error(error);

    throwIfPermissionsError(
      error,
      "You don't have permission to access these facilities.",
    );

    throw error;
  }
};

const getUserDocument = async (
  params: { email: string } | { auth0Id: string },
): Promise<firebase.firestore.DocumentData | never> => {
  const db = await getDb();

  const [key, value] = Object.entries(params)[0];

  const userResult = await db
    .collection(usersCollectionId)
    .where(key, "==", value)
    .get();

  if (userResult.docs.length > 1) {
    throw new Error(`Multiple users found matching ${key} ${value}`);
  }

  return userResult.docs[0];
};

export const getUser = async (auth0Id: string): Promise<User | null> => {
  const userDocument = await getUserDocument({ auth0Id });
  // It is ok for this method to return null if we do not find a user document
  // for the given auth0Id.  This will always be the case when a user logs in
  // for the first time.
  return userDocument ? buildUser(userDocument) : null;
};

export const getScenarioUsers = async (
  scenarioId: string,
): Promise<ScenarioUsers | null> => {
  try {
    const scenario = await getScenario(scenarioId);

    if (!scenario) {
      throw new Error(`No scenario found matching id ${scenarioId}`);
    }

    const ownerId = findKey(scenario.roles, (role) => role === "owner");
    const viewerIds = Object.entries(scenario.roles)
      .filter(([, role]) => role === "viewer")
      .map(([id]) => id);

    // We have to get the users one at a time because Firestore limits the number
    // of elements that can be included within an "in" clause to 10. In other
    // words, if a Scenario has more than 10 users, writing the query with a
    // where clause that includes each of these user's auth0Ids would fail.
    // https://firebase.google.com/docs/firestore/query-data/queries#in_and_array-contains-any
    const userFetches = viewerIds.map((auth0Id) => getUser(auth0Id));
    if (ownerId) userFetches.push(getUser(ownerId));

    const users = await Promise.all(userFetches);
    const owner = ownerId ? users.pop() : null;
    return {
      owner,
      viewers: users
        // Appeasing the TypeScript gods by filtering out possible null values
        .filter((user): user is User => user !== null)
        .sort((a, b) => ascending(a.name, b.name)),
    };
  } catch (e) {
    console.error(
      "Encountered error while attempting to retrieve scenario users: \n",
      e,
    );
    return null;
  }
};

type UserToSave = Omit<User, "id"> &
  Optional<User, "id"> & {
    auth0Id?: string;
  };

export const saveUser = async (userData: UserToSave): Promise<void> => {
  const db = await getDb();

  try {
    if (userData.id) {
      // we are updating an existing user
      db.collection(usersCollectionId)
        .doc(userData.id)
        .update(buildUpdatePayload(userData));
    } else {
      // we are creating a new user
      // auth0Id is needed for lookups so don't allow creation without it
      if (!userData.auth0Id) {
        throw new Error(
          `Missing required field "auth0Id" in object ${JSON.stringify(
            userData,
          )}`,
        );
      }
      db.collection(usersCollectionId).add(buildCreatePayload(userData));
    }
  } catch (e) {
    console.error("Encountered error while trying to save user:\n", e);
  }
};

export const addScenarioUser = async (
  scenarioId: string,
  email: string,
  currentUserEmail: string,
): Promise<User> => {
  try {
    if (email === currentUserEmail) {
      throw new Error(`Please submit a different user's email`);
    }

    const userDocument = await getUserDocument({ email });
    const auth0Id = userDocument.data().auth0Id;
    const scenario = await getScenario(scenarioId);

    if (!scenario) {
      throw new Error(`No scenario found matching id ${scenarioId}`);
    }

    scenario.roles = Object.assign({}, scenario.roles, {
      [auth0Id]: "viewer",
    });

    const savedScenario = await saveScenario(scenario);

    if (!savedScenario) {
      throw new Error(`Error updating scenario roles`);
    }

    return buildUser(userDocument);
  } catch (e) {
    console.error(
      "Encountered error while trying to add a scenario user:\n",
      e,
    );
    throwIfPermissionsError(
      e,
      "You don't have permission to edit this scenario.",
    );
    throw e;
  }
};

export const removeScenarioUser = async (
  scenarioId: string,
  userId: string,
): Promise<void> => {
  const db = await getDb();

  try {
    const user = await db.collection(usersCollectionId).doc(userId).get();

    if (!user) {
      throw new Error(`No users found matching id ${userId}`);
    }

    const auth0Id = user.data()?.auth0Id;

    const scenario = await getScenario(scenarioId);

    if (!scenario) {
      throw new Error(`No scenario found matching id ${scenarioId}`);
    }

    delete (scenario.roles as any)[auth0Id];

    const savedScenario = await saveScenario(scenario);

    if (!savedScenario) {
      throw new Error(`Error removing scenario roles`);
    }
  } catch (e) {
    console.error(
      "Encountered error while trying to remove a scenario user:\n",
      e,
    );
    throwIfPermissionsError(
      e,
      "You don't have permission to edit this scenario.",
    );
    throw e;
  }
};

const batchSetFacilityModelVersions = (
  modelVersions: ModelInputs[],
  facilityDocRef: firebase.firestore.DocumentReference,
  batch: firebase.firestore.WriteBatch,
) => {
  modelVersions.forEach((modelVersion: ModelInputs) => {
    const modelVersionDoc = facilityDocRef
      .collection(modelVersionCollectionId)
      .doc();
    batch.set(modelVersionDoc, modelVersion);
  });
};

const getFacility = async (scenarioId: string, facilityId: string) => {
  const db = await getDb();
  // construct and return a Facility object with newly saved data
  const [savedFacilityDoc, savedFacilityModelVersions] = await Promise.all([
    db
      .collection(scenariosCollectionId)
      .doc(scenarioId)
      .collection(facilitiesCollectionId)
      .doc(facilityId)
      .get(),
    getFacilityModelVersions({
      scenarioId: scenarioId,
      facilityId: facilityId,
      distinctByObservedAt: true,
    }),
  ]);
  return buildFacility(
    scenarioId,
    savedFacilityDoc,
    savedFacilityModelVersions,
  );
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
  facility: Partial<Facility>,
): Promise<Facility | void> => {
  try {
    const scenarioRef = await getScenarioRef(scenarioId);

    if (!scenarioRef) return;

    let modelInputsToSave: ModelInputsUpdate | undefined;

    if (facility.modelInputs) {
      modelInputsToSave = { ...facility.modelInputs };
      modelInputsToSave.updatedAt = currentTimestamp();
      // Use observedAt if available. If it is not provided default to today.
      modelInputsToSave.observedAt = modelInputsToSave.observedAt || new Date();
      // Normalize to the start of day in either case.
      modelInputsToSave.observedAt = startOfDay(modelInputsToSave.observedAt);
      // Ensures we don't store any attributes that our model does not know about.
      modelInputsToSave = pick(modelInputsToSave, persistedKeys);
      // remove any keys that are explicitly set to undefined or Firestore will object
      modelInputsToSave = pickBy(
        modelInputsToSave,
        (value) => value !== undefined,
      ) as ModelInputsUpdate;
    }

    const db = await getDb();
    const batch = db.batch();

    const facilitiesCollection = scenarioRef.collection(facilitiesCollectionId);

    let facilityRef: firebase.firestore.DocumentReference<firebase.firestore.DocumentData>;
    let facilityUpdate = {
      ...buildFacilityDocUpdate(facility),
      modelInputs: modelInputsToSave,
    };

    // If the facility already has an id associated with it then
    // we just need to update that facility. Otherwise, we are
    // appending a new facility to the scenario's facilities
    // collection.
    if (facility.id) {
      facilityUpdate = buildUpdatePayload(facilityUpdate);
      facilityRef = facilitiesCollection.doc(facility.id);

      // Handle facility updates in a context where we are also updating
      // modelInputs (i.e. Facility Details Page, Add Cases Shortcut)
      if (facilityUpdate.modelInputs) {
        const incomingObservedAt = facilityUpdate.modelInputs.observedAt;

        // validate against existing versions to ensure case counts are increasing monotonically
        const modelInputVersions = (
          await facilityRef.collection(modelVersionCollectionId).get()
        ).docs.map((doc) => buildModelInputs(doc.data()));

        if (modelInputVersions.length) {
          const previous = maxBy(
            modelInputVersions.filter(
              (version) =>
                differenceInCalendarDays(
                  incomingObservedAt,
                  version.observedAt,
                ) >= 1,
            ),
            (version) => version.observedAt,
          );

          const next = minBy(
            modelInputVersions.filter(
              (version) =>
                differenceInCalendarDays(
                  version.observedAt,
                  incomingObservedAt,
                ) >= 1,
            ),
            (version) => version.observedAt,
          );

          if (
            !validateCumulativeCases(facilityUpdate.modelInputs, {
              previous,
              next,
            })
          ) {
            throw new Error(
              "Failed to save. Case and death counts are cumulative, and can only increase over time.",
            );
          }
        }

        // Only update the facility if the incoming observedAt date is > than the current observedAt date in the existing facility
        const currentFacilityData = await facilityRef.get();
        const currentFacility = buildFacility(scenarioId, currentFacilityData);
        if (
          incomingObservedAt &&
          currentFacility.modelInputs.observedAt &&
          startOfDay(incomingObservedAt) >=
            startOfDay(currentFacility.modelInputs.observedAt)
        ) {
          batch.update(facilityRef, facilityUpdate);
        }
        // Handle facility updates from a context where we are not also updating
        // modelInputs (i.e. renaming a facility in the FacilityRow).
      } else {
        batch.update(facilityRef, facilityUpdate);
      }
    } else {
      facilityUpdate = buildCreatePayload(facilityUpdate);
      facilityRef = facilitiesCollection.doc();
      batch.set(facilityRef, facilityUpdate);
    }

    // If the facility's model inputs have been provided, store a new
    // versioned copy of those inputs.
    if (modelInputsToSave) {
      const newModelVersionDoc = facilityRef
        .collection(modelVersionCollectionId)
        .doc();

      batch.set(newModelVersionDoc, modelInputsToSave);
    }
    await batch.commit();

    // construct and return a Facility object with newly saved data
    return await getFacility(scenarioId, facilityRef.id);
  } catch (error) {
    console.error("Encountered error while attempting to save a facility:");
    console.error(error);
    throwIfPermissionsError(
      error,
      "You don't have permission to edit this facility.",
    );
    throw error;
  }
};

export const duplicateFacility = async (
  scenarioId: string,
  facility: Facility,
): Promise<Facility | void> => {
  const facilityId = facility.id;
  const facilityCopy = Object.assign({}, facility, {
    name: `Copy of ${facility.name}`,
  });
  const db = await getDb();
  const batch = db.batch();
  const scenarioRef = await getScenarioRef(scenarioId);
  if (!scenarioRef) return;
  const facilityRef = scenarioRef.collection(facilitiesCollectionId).doc();

  try {
    const modelVersions = await getFacilityModelVersions({
      scenarioId,
      facilityId,
    });
    batchSetFacilityModelVersions(modelVersions, facilityRef, batch);

    // Delete old facility id and set new createdAt timestamp on payload
    delete facilityCopy.id;
    const payload = buildCreatePayload(facilityCopy);

    batch.set(facilityRef, payload);
    await batch.commit();

    return await getFacility(scenarioId, facilityRef.id);
  } catch (error) {
    console.error(
      `Encountered error while attempting to duplicate facility: ${facilityId}`,
    );
    console.error(error);
    throwIfPermissionsError(
      error,
      "You don't have permission to edit this facility.",
    );
    throw error;
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
    const facilityDocRef = scenarioRef
      .collection(facilitiesCollectionId)
      .doc(facilityId);

    const modelVersions = await facilityDocRef
      .collection(modelVersionCollectionId)
      .get();

    const scenarioDoc = await scenarioRef.get();
    const scenario = buildScenario(scenarioDoc);
    const referenceFacilities = Object.assign(
      {},
      scenario[referenceFacilitiesProp],
    );

    const db = await getDb();
    const batch = db.batch();

    // Remove the facility from the scenario referenceFacilities mapping
    delete referenceFacilities[facilityId];
    const payload = buildUpdatePayload({
      ...scenario,
      [referenceFacilitiesProp]: referenceFacilities,
    });
    batch.update(scenarioRef, payload);

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
    throwIfPermissionsError(
      error,
      "You don't have permission to delete this facility.",
    );
    throw error;
  }
};

export const duplicateScenario = async (
  scenarioId: string,
): Promise<Scenario | void> => {
  try {
    const scenario = await getScenario(scenarioId);

    if (!scenario) {
      console.error(`No scenario found for scenario: ${scenarioId}`);
      return;
    }

    const userId = currentUserId();
    const timestamp = currentTimestamp();
    const db = await getDb();
    const batch = db.batch();

    // Duplicate and save the Scenario
    const scenarioDoc = db.collection(scenariosCollectionId).doc();

    const baselinePopulationsCopy = scenario.baselinePopulations
      ? [...scenario.baselinePopulations]
      : [];

    const referenceFacilitiesCopy = scenario[referenceFacilitiesProp]
      ? { ...scenario[referenceFacilitiesProp] }
      : {};

    const scenarioData = Object.assign({}, SCENARIO_DEFAULTS, {
      name: `Copy of ${scenario.name}`,
      description: `This is a copy of the '${
        scenario.name
      }' scenario, made on ${format(new Date(), MMMMdyyyy)}`,
      baselinePopulations: [...baselinePopulationsCopy],
      [referenceFacilitiesProp]: referenceFacilitiesCopy,
      roles: {
        [userId]: "owner",
      },
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    batch.set(scenarioDoc, scenarioData);

    // Duplicate and save all of the Facilities
    const facilities = await getFacilities(scenarioId);
    for (const facility of facilities || []) {
      const facilityCopy = Object.assign({}, facility);
      delete facilityCopy.id;
      delete facilityCopy.scenarioId;

      const facilityDoc = scenarioDoc.collection(facilitiesCollectionId).doc();

      batch.set(facilityDoc, facilityCopy);

      // Duplicate and save all of the facility's modelVersions
      const modelVersions = await getFacilityModelVersions({
        scenarioId,
        facilityId: facility.id,
      });

      batchSetFacilityModelVersions(modelVersions, facilityDoc, batch);
    }

    await batch.commit();

    const duplicatedScenario = await scenarioDoc.get();

    return buildScenario(duplicatedScenario);
  } catch (error) {
    console.error(
      `Encountered error while attempting to duplicate scenario: ${scenarioId}`,
    );
    console.error(error);
    return;
  }
};

export const deleteScenario = async (
  scenarioId: string,
): Promise<Scenario | void> => {
  try {
    const scenarioRef = await getScenarioRef(scenarioId);

    if (!scenarioRef) {
      console.error(`No scenario found for scenario: ${scenarioId}`);
      return;
    }

    const db = await getDb();
    const batch = db.batch();

    const facilities = await scenarioRef
      .collection(facilitiesCollectionId)
      .get();

    for (const facility of facilities.docs || []) {
      const modelVersions = await facility.ref
        .collection(modelVersionCollectionId)
        .get();

      modelVersions.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      batch.delete(facility.ref);
    }

    batch.delete(scenarioRef);

    await batch.commit();
  } catch (error) {
    console.error(
      `Encountered error while attempting to delete scenario: ${scenarioId}`,
    );
    console.error(error);
    throwIfPermissionsError(
      error,
      "You don't have permission to delete this scenario.",
    );
  }
};

export const getReferenceFacilities = async ({
  stateName,
  systemType,
}: {
  stateName: string;
  systemType: string;
}) => {
  const db = await getDb();

  const facilities = await db
    .collection(referenceFacilitiesCollectionId)
    .where("stateName", "==", stateName)
    .where("facilityType", "==", systemType)
    .get();

  const facilitiesCovidCases = await Promise.all(
    facilities.docs.map(async (facilityDoc) => {
      return (
        await facilityDoc.ref
          .collection(referenceFacilitiesCovidCasesCollectionId)
          .get()
      ).docs;
    }),
  );

  // please excuse the typescript bypass, the d3.zip typedef is busted
  const referenceFacilities = zip(
    facilities.docs as any[],
    facilitiesCovidCases,
  );

  return referenceFacilities.map(([facility, covidCases]) =>
    buildReferenceFacility(facility, covidCases),
  );
};
