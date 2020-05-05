import { parseISO } from "date-fns";
import * as firebase from "firebase/app";

import { PlannedRelease } from "../impact-dashboard/EpidemicModelContext";
import { Facility, ModelInputs, Scenario } from "../page-multi-facility/types";

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
