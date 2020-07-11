import * as dateFns from "date-fns";
import ndarray from "ndarray";

import {
  EpidemicModelInputs,
  getLocaleDefaults,
  RateOfSpread,
  totalConfirmedCases,
  totalConfirmedDeaths,
} from "../impact-dashboard/EpidemicModelContext";
import { countCasesForDay } from "../impact-dashboard/ImpactProjectionTableContainer";
import { NUM_DAYS } from "../infection-model";
import { calculateCurves, curveInputsFromUserInputs } from "../infection-model";
import { getAllValues, getColView } from "../infection-model/matrixUtils";
import { seirIndex } from "../infection-model/seir";
import { LocaleData } from "../locale-data-context";
import { ModelInputs } from "../page-multi-facility/types";
import { combineFacilitiesProjectionData } from "../page-response-impact/responseChartData";

export function getCaseCount(curveData: ndarray<number>) {
  const cases = [];
  for (let day = 0; day < curveData.shape[0]; ++day) {
    const caseCountForDay = countCasesForDay(curveData, day);
    cases.push(caseCountForDay);
  }
  return cases;
}

export const today = dateFns.endOfToday();
export const ninetyOneDaysAgo = dateFns.subDays(today, 91);
export const ninetyDaysAgo = dateFns.subDays(today, 90);

function addProjectionPadding(values: number[], numDays = 90): number[] {
  return [...Array(numDays - values.length).fill(0), ...values];
}

export function getVersionForProjection(versions: ModelInputs[]) {
  const versionsWithCases = versions
    .sort(({ observedAt: a }, { observedAt: b }) => dateFns.compareAsc(a, b))
    .filter((version) => totalConfirmedCases(version) > 0);

  const version90DaysAgo = versionsWithCases.find((v) =>
    dateFns.isSameDay(v.observedAt, ninetyDaysAgo),
  );

  let versionForProjection: ModelInputs | undefined = version90DaysAgo;

  // If the version from 90 days ago has 0 or no data, look forward for the next
  // version with cases
  if (!version90DaysAgo) {
    const closestVersionWithCases = versionsWithCases.find((version) => {
      const date = dateFns.closestTo(
        ninetyDaysAgo,
        versionsWithCases.map((v) => v.observedAt),
      );
      return dateFns.isSameDay(version.observedAt, date);
    });
    versionForProjection = closestVersionWithCases;
  }
  return versionForProjection;
}

export function getProjectedData(epidemicModelInputs: EpidemicModelInputs) {
  if (!epidemicModelInputs || !epidemicModelInputs?.observedAt) {
    throw `No version found with cases`;
  }

  let numDaysAfterNinetyDays = 0;

  if (dateFns.isAfter(epidemicModelInputs.observedAt, ninetyOneDaysAgo)) {
    numDaysAfterNinetyDays = dateFns.differenceInCalendarDays(
      epidemicModelInputs.observedAt,
      ninetyOneDaysAgo,
    );
  }

  const projectionNumDays = NUM_DAYS - numDaysAfterNinetyDays;
  const curveInputs = curveInputsFromUserInputs(epidemicModelInputs);
  const curveData = calculateCurves(curveInputs, projectionNumDays);

  if (!curveData) {
    return {
      projectedFatalities: addProjectionPadding([]),
      projectedCases: addProjectionPadding([]),
    };
  }

  const summedProjectionData = combineFacilitiesProjectionData(
    [curveData],
    projectionNumDays,
  );

  return {
    projectedFatalities: addProjectionPadding(
      getAllValues(getColView(summedProjectionData, seirIndex.fatalities)),
    ),
    projectedCases: addProjectionPadding(getCaseCount(summedProjectionData)),
  };
}

export function getActualDataForFacility(modelVersions: ModelInputs[]) {
  const datesInterval = dateFns.eachDayOfInterval({
    start: dateFns.addDays(ninetyDaysAgo, 1),
    end: today,
  });

  const actualData: { [key: string]: number[] } = {
    actualCases: [],
    actualFatalities: [],
  };

  datesInterval.forEach((date) => {
    const existingVersion = modelVersions.find((version: any) => {
      return dateFns.isSameDay(version.observedAt, date);
    });

    const cases = existingVersion ? totalConfirmedCases(existingVersion) : 0;
    const fatalities = existingVersion
      ? totalConfirmedDeaths(existingVersion)
      : 0;

    actualData.actualCases.push(cases);
    actualData.actualFatalities.push(fatalities);
  });

  return actualData;
}

export function getFacilitiesProjectionData(
  modelVersions: ModelInputs[][],
  localeDataSource: LocaleData,
) {
  return modelVersions.map((versions) => {
    const versionForProjection = getVersionForProjection(versions);
    const epidemicModelInputs = {
      ...versionForProjection,
      ...getLocaleDefaults(
        localeDataSource,
        versionForProjection?.stateName,
        versionForProjection?.countyName,
        RateOfSpread.moderate,
      ),
    };
    return getProjectedData(epidemicModelInputs);
  });
}

interface ProjectionChartData {
  [key: string]: number[];
}

export function getChartData(
  modelVersions: ModelInputs[][],
  localeDataSource: LocaleData,
) {
  const facilitiesActualData: ProjectionChartData[] = modelVersions.map(
    getActualDataForFacility,
  );
  const facilitiesProjectionData: ProjectionChartData[] = getFacilitiesProjectionData(
    modelVersions,
    localeDataSource,
  );
  const chartData: ProjectionChartData = {
    projectedFatalities: [],
    projectedCases: [],
    actualFatalities: [],
    actualCases: [],
  };

  const actualAndProjectedData = [
    ...facilitiesProjectionData,
    ...facilitiesActualData,
  ];

  // Sum actual/projected cases and fatalities per day across all facilities
  actualAndProjectedData.forEach((facilityData) => {
    Object.keys(chartData).forEach((bucket) => {
      if (facilityData[bucket]) {
        facilityData[bucket].forEach((value: number, index: number) => {
          chartData[bucket][index] = (chartData[bucket][index] || 0) + value;
        });
      }
    });
  });

  return chartData;
}
