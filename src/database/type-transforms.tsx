import { parse, parseISO, startOfToday } from "date-fns";
import * as firebase from "firebase/app";
import { pick } from "lodash";

import { PlannedRelease } from "../impact-dashboard/EpidemicModelContext";
import {
  Facility,
  ModelInputs,
  ReferenceFacility,
  ReferenceFacilityCovidCase,
  Scenario,
  User,
} from "../page-multi-facility/types";

const timestampToDate = (timestamp: firebase.firestore.Timestamp): Date => {
  return timestamp.toDate();
};

const buildPlannedRelease = (plannedReleaseData: any): PlannedRelease => {
  let plannedRelease: PlannedRelease = plannedReleaseData;

  const plannedReleaseDataDate = plannedReleaseData.date;
  if (plannedReleaseDataDate instanceof firebase.firestore.Timestamp) {
    plannedRelease.date = timestampToDate(plannedReleaseDataDate);
  } else if (typeof plannedReleaseDataDate === "string") {
    plannedRelease.date = parseISO(plannedReleaseDataDate);
  } else {
    throw new Error(
      `Unexpected Planned Release Date type found in: ${plannedReleaseDataDate}`,
    );
  }

  return plannedRelease;
};

export const buildModelInputs = (document: any): ModelInputs => {
  let modelInputs: ModelInputs = document;

  modelInputs.observedAt = timestampToDate(document.observedAt);
  modelInputs.updatedAt = timestampToDate(document.updatedAt);

  const plannedReleases = document.plannedReleases;
  if (plannedReleases) {
    modelInputs.plannedReleases = plannedReleases.map(
      (plannedReleaseData: any) => {
        return buildPlannedRelease(plannedReleaseData);
      },
    );
  }

  return modelInputs;
};

export const buildFacility = (
  scenarioId: string,
  document: firebase.firestore.DocumentData,
): Facility => {
  const documentData = document.data();

  let facility: Facility = documentData;
  facility.id = document.id;
  facility.scenarioId = scenarioId;
  facility.createdAt = timestampToDate(documentData.createdAt);
  facility.updatedAt = timestampToDate(documentData.updatedAt);
  facility.modelInputs = buildModelInputs(documentData.modelInputs);

  return facility;
};

export const buildScenario = (
  document: firebase.firestore.DocumentData,
): Scenario => {
  const documentData = document.data();

  let scenario: Scenario = documentData;
  scenario.id = document.id;
  scenario.createdAt = timestampToDate(documentData.createdAt);
  scenario.updatedAt = timestampToDate(documentData.updatedAt);
  scenario.baselinePopulations = documentData.hasOwnProperty(
    "baselinePopulations",
  )
    ? documentData.baselinePopulations.map(
        (population: {
          date: firebase.firestore.Timestamp;
          incarceratedPopulation: number;
          staffPopulation: number;
        }) => {
          return {
            ...population,
            date: timestampToDate(population.date),
          };
        },
      )
    : [];

  // Runtime migration: make sure a default value is set for
  // promo status flags added since the last data shakeup
  // TODO: Remove this once automated migration is in place per #186
  const newPromoStatuses = ["rtChart"];
  newPromoStatuses.forEach((flagName) => {
    if (scenario.promoStatuses[flagName] === undefined) {
      scenario.promoStatuses[flagName] = true;
    }
  });

  return scenario;
};

export const buildUser = (document: firebase.firestore.DocumentData): User => {
  const data = document.data();

  return { ...pick(data, ["name", "email"]), id: document.id };
};

const parseStartOfDay = (dateStr: string) => {
  // returns specified Date in the local TZ at time 00:00:00
  return parse(dateStr, "yyyy-MM-dd", startOfToday());
};

const buildCovidCase = (
  doc: firebase.firestore.DocumentData,
): ReferenceFacilityCovidCase => {
  const data = doc.data();

  const observedAt = parseStartOfDay(doc.id);

  return {
    observedAt,
    ...data,
  };
};

export const buildReferenceFacility = (
  facilityDocument: firebase.firestore.DocumentData,
  facilityCovidCaseDocuments: firebase.firestore.DocumentData[],
): ReferenceFacility => {
  const data = facilityDocument.data();

  // convert all known timestamps to dates
  const toSimpleTimeseries = (record: {
    date: firebase.firestore.Timestamp;
    value: number;
  }) => ({
    date: timestampToDate(record.date),
    value: record.value,
  });

  let {
    state,
    canonicalName,
    facilityType,
    capacity,
    population,
    ...other
  } = data;

  // cast known types
  state = String(state);
  canonicalName = String(canonicalName);
  facilityType = String(facilityType);
  // if these are not arrays then unfortunately they are garbage
  if (!Array.isArray(capacity)) {
    capacity = [];
  }
  if (!Array.isArray(population)) {
    population = [];
  }

  capacity = capacity.map(toSimpleTimeseries);
  population = population.map(toSimpleTimeseries);

  return {
    id: facilityDocument.id,
    state,
    canonicalName,
    facilityType,
    capacity,
    population,
    covidCases: facilityCovidCaseDocuments.map(buildCovidCase),
    ...other,
  };
};
