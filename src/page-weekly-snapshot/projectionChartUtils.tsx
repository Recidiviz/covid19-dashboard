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

export const today = () => dateFns.endOfToday();
export const ninetyOneDaysAgo = () => dateFns.subDays(today(), 91);
export const ninetyDaysAgo = () => dateFns.subDays(today(), 90);

function addProjectionPadding(values: number[], numDays = 90): number[] {
  return [...Array(numDays - values.length).fill(0), ...values];
}

export function getVersionForProjection(versions: ModelInputs[]) {
  const versionsWithCases = versions
    .sort(({ observedAt: a }, { observedAt: b }) => dateFns.compareAsc(a, b))
    .filter((version) => totalConfirmedCases(version) > 0);

  const version90DaysAgo = versionsWithCases.find((v) =>
    dateFns.isSameDay(v.observedAt, ninetyDaysAgo()),
  );

  let versionForProjection: ModelInputs | undefined = version90DaysAgo;

  // If the version from 90 days ago has 0 or no data, look forward for the next
  // version with cases
  if (!version90DaysAgo) {
    const closestVersionWithCases = versionsWithCases.find((version) => {
      const date = dateFns.closestTo(
        ninetyDaysAgo(),
        versionsWithCases.map((v) => v.observedAt),
      );
      return dateFns.isSameDay(version.observedAt, date);
    });
    versionForProjection = closestVersionWithCases;
  }
  return versionForProjection;
}

/**
 * Takes a facility's EpidemicModelInputs and returns an object with the properties
 * projectedFatalities and projectedCases that each are arrays of summed values for staff
 * and incarcerated fatalities and cases over the past 90 days.
 *
 * The epidemicModelInputs should always have an observedAt property.
 * If for some reason it doesn't, we return arrays of length 90 filled with zeros.
 *
 * If the observedAt property is between day 90 and day 0, we project the data
 * from that date onward. If the date is past 90 days ago, then we project
 * with that version for 90 days.
 *
 * For example, if 90 days ago is 6/1, and the version is from 6/10, then we
 * calculate the number of days for the projection as (NUM_DAYS - the difference
 * between in calendar days between 6/1 and 6/10), or 90 - 9.
 *
 * If the version is from 95 days ago, then we still project for 90 days and
 * use this version as if it were 90 days ago.
 *
 * @param epidemicModelInputs - An object of a facility's model inputs with added locale defaults
 * @returns projectedData - An object of projectedFatalities and projectedCases, both arrays
 * should have the same length as NUM_DAYS and their values are a sum of staff
 * incarcerated data
 */
export function getProjectedData(epidemicModelInputs: EpidemicModelInputs) {
  if (!epidemicModelInputs?.observedAt) {
    return {
      projectedFatalities: addProjectionPadding([]),
      projectedCases: addProjectionPadding([]),
    };
  }

  let numDaysAfterNinetyDays = 0;

  if (dateFns.isAfter(epidemicModelInputs.observedAt, ninetyOneDaysAgo())) {
    numDaysAfterNinetyDays = dateFns.differenceInCalendarDays(
      epidemicModelInputs.observedAt,
      ninetyOneDaysAgo(),
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
    start: dateFns.addDays(ninetyDaysAgo(), 1),
    end: today(),
  });
  const versionsDates = modelVersions.map((v) => v.observedAt);

  const actualData: { [key: string]: number[] } = {
    actualCases: [],
    actualFatalities: [],
  };

  datesInterval.forEach((date) => {
    const existingVersion = modelVersions.find((version: any) => {
      return dateFns.isSameDay(version.observedAt, date);
    });
    const closestVersionIndex = dateFns.closestIndexTo(date, versionsDates);
    const versionForTotal =
      existingVersion || modelVersions[closestVersionIndex];

    const cases = totalConfirmedCases(versionForTotal);
    const fatalities = totalConfirmedDeaths(versionForTotal);

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
