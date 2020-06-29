import { parse, parseISO, startOfToday } from "date-fns";
import firebase from "firebase/app";
import { pick } from "lodash";

import { PlannedRelease } from "../impact-dashboard/EpidemicModelContext";
import {
  Facility,
  ModelInputs,
  PERSISTED_FACILITY_KEYS,
  ReferenceFacility,
  ReferenceFacilityCovidCase,
  Scenario,
  User,
} from "../page-multi-facility/types";
import { referenceFacilitiesProp } from ".";
import { FacilityDocUpdate } from "./types";

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
  let modelInputs: ModelInputs = { ...document };

  modelInputs.observedAt = timestampToDate(document.observedAt);
  modelInputs.updatedAt = timestampToDate(document.updatedAt);
  // this field was renamed, existing instances should be mapped over
  if (document.stateCode) {
    modelInputs.stateName = modelInputs.stateName || document.stateCode;
    delete (modelInputs as any).stateCode;
  }

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
  modelVersions?: ModelInputs[],
): Facility => {
  const documentData = document.data();

  let { name, description, systemType } = documentData;
  const id = document.id;
  const createdAt = timestampToDate(documentData.createdAt);
  const updatedAt = timestampToDate(documentData.updatedAt);
  const modelInputs = buildModelInputs(documentData.modelInputs);

  return {
    createdAt,
    description,
    id,
    modelInputs,
    name,
    scenarioId,
    systemType,
    updatedAt,
    modelVersions: modelVersions || [],
  };
};

export const buildFacilityDocUpdate = (
  facility: Partial<Facility>,
): FacilityDocUpdate => {
  return pick(facility, PERSISTED_FACILITY_KEYS);
};

export const buildScenario = (
  document: firebase.firestore.DocumentData,
): Scenario => {
  const documentData = document.data();
  let scenario: Scenario = documentData;
  scenario.id = document.id;
  scenario.createdAt = timestampToDate(documentData.createdAt);
  scenario.updatedAt = timestampToDate(documentData.updatedAt);
  scenario.referenceDataObservedAt = documentData.referenceDataObservedAt
    ? timestampToDate(documentData.referenceDataObservedAt)
    : undefined;
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

  // this is a newer field that isn't guaranteed to exist in storage;
  // provide a default here because it's required by the type definition
  scenario[referenceFacilitiesProp] = scenario[referenceFacilitiesProp] || {};

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

  // NOTE: there are other fields that may be present in the document;
  // as they are added to the ReferenceFacility type they should be handled here
  let {
    stateName,
    canonicalName,
    facilityType,
    capacity,
    population,
    countyName,
    createdAt,
  } = data;

  // do some explicit type casts for safety

  // we don't expect these fields to ever be missing from the document;
  // bad things will result if they are
  stateName = String(stateName);
  canonicalName = String(canonicalName);
  facilityType = String(facilityType);
  countyName = String(countyName);
  createdAt = timestampToDate(data.createdAt);

  // if these are not arrays then unfortunately they are garbage;
  // this probably means the documents have been mangled somehow,
  // it is not an expected case
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
    stateName,
    countyName,
    canonicalName,
    facilityType,
    capacity,
    population,
    createdAt,
    covidCases: facilityCovidCaseDocuments.map(buildCovidCase),
  };
};
