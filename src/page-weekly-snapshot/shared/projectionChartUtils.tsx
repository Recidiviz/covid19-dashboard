import * as dateFns from "date-fns";
import { chunk } from "lodash";
import ndarray from "ndarray";

import {
  EpidemicModelInputs,
  getLocaleDefaults,
  RateOfSpread,
  totalConfirmedCases,
  totalIncarceratedConfirmedCases,
  totalIncarceratedConfirmedDeaths,
  totalStaffConfirmedCases,
  totalStaffConfirmedDeaths,
} from "../../impact-dashboard/EpidemicModelContext";
import {
  countActiveCasesForDay,
  countCasesForDay,
} from "../../impact-dashboard/ImpactProjectionTableContainer";
import { NUM_DAYS } from "../../infection-model";
import {
  calculateCurves,
  curveInputsFromUserInputs,
} from "../../infection-model";
import { getAllValues, getColView } from "../../infection-model/matrixUtils";
import { seirIndex } from "../../infection-model/seir";
import { LocaleData } from "../../locale-data-context";
import { ModelInputs } from "../../page-multi-facility/types";

export const today = () => dateFns.endOfToday();
export const ninetyDaysAgo = () => dateFns.subDays(today(), NUM_DAYS);

export const ninetyDayInterval = () =>
  dateFns.eachDayOfInterval({
    start: ninetyDaysAgo(),
    end: today(),
  });

/**
 * Returns an array of 6 tick values to use on the projection chart
 * Using this function instead of the XYFrame option `ticks` because it does not
 * consistently start with the first value on the x axis
 *
 * @returns tickValues - [1/1/2020, 1/12/2020, ...]
 */
export const xAxisTickValues = () => {
  const dates = ninetyDayInterval();
  const chunkSize = NUM_DAYS / 5;
  const chunks = chunk(dates, chunkSize);
  return chunks.map((c) => c[0]);
};

// Projection should show 8 data points, the current day + 7 days
const NEXT_SEVEN_DAYS_PROJECTION = 8;

type ProjectedCases = {
  projectedStaffCases: number[];
  projectedIncarceratedCases: number[];
};

type ProjectedCasesAndFatalities = ProjectedCases & {
  projectedIncarceratedFatalities: number[];
  projectedStaffFatalities: number[];
};

interface FacilitiesData {
  [key: string]: number[];
  staffCases: number[];
  staffFatalities: number[];
  incarceratedCases: number[];
  incarceratedFatalities: number[];
}

interface ChartData {
  [key: string]: number[];
  cases: number[];
  projectedCases: number[];
}

export interface TableData {
  staffCasesToday: number;
  staffFatalitiesToday: number;
  incarceratedCasesToday: number;
  incarceratedFatalitiesToday: number;
  projectedStaffCasesToday: number;
  projectedStaffFatalitiesToday: number;
  projectedIncarceratedCasesToday: number;
  projectedIncarceratedFatalitiesToday: number;
}

function addProjectionPadding(values: number[], numDays = NUM_DAYS): number[] {
  return [...Array(numDays - values.length + 1).fill(0), ...values];
}

const findVersionForDate = (versions: ModelInputs[], date: Date) => {
  return versions.find((version: any) => {
    return dateFns.isSameDay(version.observedAt, date);
  });
};

function calculateCurveData(
  epidemicModelInputs: EpidemicModelInputs,
  projectionNumDays: number,
) {
  const curveInputs = curveInputsFromUserInputs(epidemicModelInputs);
  return calculateCurves(curveInputs, projectionNumDays);
}

/**
 * Takes an ndarray and sums the values for all seir indexes except susceptible
 * and exposed and returns the total number of cases per day
 *
 * @param curveData - { staff: [...], incarcerated: [...], shape: [90, 9], stride: [9, 1] }
 * @returns cases - [0, 1, 2, 3...89]
 */
export function getCaseCount(curveData: ndarray<number>) {
  const cases = [];
  for (let day = 0; day < curveData.shape[0]; ++day) {
    const caseCountForDay = countCasesForDay(curveData, day);
    cases.push(caseCountForDay);
  }
  return cases;
}

/**
 * Takes an ndarray and sums the values for active cases per day, which include
 * infectious, mild, severe, hospitalized values.
 *
 * @param curveData - { staff: [...], incarcerated: [...], shape: [90, 9], stride: [9, 1] }
 * @returns cases - [0, 1, 2, 3...89]
 */
export function getActiveCaseCount(curveData: ndarray<number>) {
  const cases = [];
  for (let day = 0; day < curveData.shape[0]; ++day) {
    const caseCountForDay = countActiveCasesForDay(curveData, day);
    cases.push(caseCountForDay);
  }
  return cases;
}

/**
 * Takes an array of facility model versions and a date and returns the version to use
 * for the curve chart projection. If a version isn't found for the given date,
 * find the closest version to that date with cases.
 *
 * @param modelInputs - An array of facility model inputs
 * @param date - The date you want a version for, or a version closest to that date
 * @returns versionForProjection - A facility's model inputs object
 */
export function getVersionForProjection(versions: ModelInputs[], date: Date) {
  const versionsWithCases = versions
    .sort(({ observedAt: a }, { observedAt: b }) => dateFns.compareAsc(a, b))
    .filter((version) => totalConfirmedCases(version) > 0);

  let versionForProjection:
    | ModelInputs
    | undefined = versionsWithCases.find((v) =>
    dateFns.isSameDay(v.observedAt, date),
  );

  if (!versionForProjection) {
    const closestDate = dateFns.closestTo(
      date,
      versionsWithCases.map((v) => v.observedAt),
    );
    const closestVersionWithCases = findVersionForDate(
      versionsWithCases,
      closestDate,
    );
    versionForProjection = closestVersionWithCases;
  }
  return versionForProjection;
}

/**
 * Takes a facility's EpidemicModelInputs and returns an object with the properties
 * for projected staff and incarcerated cases and fatalities. Each property is an
 * array of values for 90 days.
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
 * @returns projectedData - An object of projected staff/incarcerated cases/fatalities, both arrays
 * should have the same length as NUM_DAYS
 */
export function get90DaysAgoProjection(
  epidemicModelInputs: EpidemicModelInputs,
): ProjectedCasesAndFatalities {
  const zeroProjection = {
    projectedStaffFatalities: addProjectionPadding([]),
    projectedIncarceratedFatalities: addProjectionPadding([]),
    projectedStaffCases: addProjectionPadding([]),
    projectedIncarceratedCases: addProjectionPadding([]),
  };

  if (!epidemicModelInputs?.observedAt) return zeroProjection;

  let numDaysAfterNinetyDays = 0;

  if (dateFns.isAfter(epidemicModelInputs.observedAt, ninetyDaysAgo())) {
    numDaysAfterNinetyDays = dateFns.differenceInCalendarDays(
      epidemicModelInputs.observedAt,
      ninetyDaysAgo(),
    );
  }

  const projectionNumDays = NUM_DAYS - numDaysAfterNinetyDays;

  if (projectionNumDays <= 0) return zeroProjection;

  const curveData = calculateCurveData(epidemicModelInputs, projectionNumDays);

  if (!curveData) return zeroProjection;

  return {
    projectedStaffFatalities: addProjectionPadding(
      getAllValues(getColView(curveData.staff, seirIndex.fatalities)),
    ),
    projectedIncarceratedFatalities: addProjectionPadding(
      getAllValues(getColView(curveData.incarcerated, seirIndex.fatalities)),
    ),
    projectedStaffCases: addProjectionPadding(getCaseCount(curveData.staff)),
    projectedIncarceratedCases: addProjectionPadding(
      getCaseCount(curveData.incarcerated),
    ),
  };
}

/**
 * Takes an array of modelVersions for one facility and a date and returns the
 * version closest to that date. If a previous version is available, it prefers
 * that. If it's not available it takes the next closest version.
 *
 * @param modelVersions - An array of modelVersions for one facility
 * @param date - The date to compare for finding the closest version
 * @returns modelVersion - A facility's model version
 */
function findClosestVersionForDates(versions: ModelInputs[], date: Date) {
  const sortedVersionDates = versions
    .map((v) => v.observedAt)
    .sort((a, b) => a.getTime() - b.getTime());

  // filter to dates earlier than the date we need a version for
  const closestPreviousDates = sortedVersionDates.filter((versionDate) => {
    return dateFns.startOfDay(versionDate) <= dateFns.startOfDay(date);
  });

  // if there are previous dates, use the most recent one
  // otherwise use the next forward looking date we have
  const mostRecentDate = closestPreviousDates.length
    ? closestPreviousDates[closestPreviousDates.length - 1]
    : sortedVersionDates[0];
  return findVersionForDate(versions, mostRecentDate);
}

/**
 * Takes an array of modelVersions for one facility and returns the
 * staff and incarcerated cases and deaths for each of the past 90 days.
 *
 * If a facility is missing a version for a date, then we use the data from
 * the closest version to that date.
 *
 * @param modelVersions - An array of modelVersions for one facility
 * @returns actualData - An object of staff/incarcerated cases/fatalities 90 day arrays
 */
export function getFacilitiesData(modelVersions: ModelInputs[]) {
  const datesInterval = ninetyDayInterval();

  const actualData: FacilitiesData = {
    staffCases: [],
    incarceratedCases: [],
    staffFatalities: [],
    incarceratedFatalities: [],
  };

  datesInterval.forEach((date) => {
    const existingVersion = findVersionForDate(modelVersions, date);

    let closestVersion: ModelInputs | undefined;

    if (!existingVersion) {
      closestVersion = findClosestVersionForDates(modelVersions, date);
    }

    const versionForTotal = existingVersion || closestVersion;

    let incarceratedCases = 0;
    let incarceratedFatalities = 0;
    let staffCases = 0;
    let staffFatalities = 0;

    if (versionForTotal) {
      incarceratedCases = totalIncarceratedConfirmedCases(versionForTotal);
      staffCases = totalStaffConfirmedCases(versionForTotal);
      incarceratedFatalities = totalIncarceratedConfirmedDeaths(
        versionForTotal,
      );
      staffFatalities = totalStaffConfirmedDeaths(versionForTotal);
    }

    actualData.staffCases.push(staffCases);
    actualData.staffFatalities.push(staffFatalities);
    actualData.incarceratedCases.push(incarceratedCases);
    actualData.incarceratedFatalities.push(incarceratedFatalities);
  });

  return actualData;
}

/**
 * Takes an array of modelVersions for multiple facilities and the locale data
 * and finds the version to use for the projection. It adds the locale data to this
 * version to create an EpidemicModelInputs object, which is passed to
 * get90DaysAgoProjection to calculate the curve data for its facility
 *
 * @param modelVersions - An array of modelVersions for multiple facilities
 * @param localeDataSource - LocaleData from the LocaleDataContext
 * @param date - The date used to find the version for the projection's starting point
 * @param projectionFn - The function for generating the projection per each facility's input
 * @returns projectionData[] - An array of projectedData objects for each facility,
 * either ProjectedCasesAndFatalities or ProjectedCases
 */
export function getFacilitiesProjectionData(
  modelVersions: ModelInputs[][],
  localeDataSource: LocaleData,
  date: Date,
  projectionFn:
    | ((v: EpidemicModelInputs) => ProjectedCasesAndFatalities)
    | ((v: EpidemicModelInputs) => ProjectedCases),
): ProjectedCasesAndFatalities[] | ProjectedCases[] {
  return modelVersions.map((versions) => {
    const versionForProjection = getVersionForProjection(versions, date);
    const epidemicModelInputs = {
      ...versionForProjection,
      ...getLocaleDefaults(
        localeDataSource,
        versionForProjection?.stateName,
        versionForProjection?.countyName,
        RateOfSpread.moderate,
      ),
    };
    return projectionFn(epidemicModelInputs);
  });
}

/**
 * Takes an array of modelVersions for multiple facilities and the locale data
 * and returns the total projected and actual cases and fatalities for the past 90 days
 * for every facility
 *
 * @param modelVersions - An array of modelVersions for multiple facilities
 * @param localeDataSource - LocaleData from the LocaleDataContext
 * @returns tableData, chartData - { projectedCases: [0..89], cases: [0..89], }
 */
export function getImpactChartAndTableData(
  modelVersions: ModelInputs[][],
  localeDataSource: LocaleData,
) {
  const facilitiesData: FacilitiesData[] = modelVersions.map(getFacilitiesData);
  const projectionData = getFacilitiesProjectionData(
    modelVersions,
    localeDataSource,
    ninetyDaysAgo(),
    get90DaysAgoProjection,
  ) as ProjectedCasesAndFatalities[];

  const chartData: ChartData = {
    projectedCases: addProjectionPadding([]),
    cases: addProjectionPadding([]),
  };

  const tableData: TableData = {
    staffCasesToday: 0,
    staffFatalitiesToday: 0,
    incarceratedCasesToday: 0,
    incarceratedFatalitiesToday: 0,
    projectedStaffCasesToday: 0,
    projectedStaffFatalitiesToday: 0,
    projectedIncarceratedCasesToday: 0,
    projectedIncarceratedFatalitiesToday: 0,
  };

  for (let index = 0; index <= NUM_DAYS; index++) {
    facilitiesData.forEach((facilityData) => {
      // Sum staff+incarcerated across all facilities
      chartData.cases[index] +=
        facilityData.staffCases[index] + facilityData.incarceratedCases[index];

      // Sum the values across all facilities for today's index
      if (index === NUM_DAYS) {
        tableData.staffCasesToday += facilityData.staffCases[index];
        tableData.staffFatalitiesToday += facilityData.staffFatalities[index];
        tableData.incarceratedCasesToday +=
          facilityData.incarceratedCases[index];
        tableData.incarceratedFatalitiesToday +=
          facilityData.incarceratedFatalities[index];
      }
    });

    projectionData.forEach((projection) => {
      // Sum staff+incarcerated across all facilities
      chartData.projectedCases[index] +=
        projection.projectedStaffCases[index] +
        projection.projectedIncarceratedCases[index];

      // Sum the values across all facilities for today's index
      if (index === NUM_DAYS) {
        tableData.projectedStaffCasesToday +=
          projection.projectedStaffCases[index];
        tableData.projectedStaffFatalitiesToday +=
          projection.projectedStaffFatalities[index];
        tableData.projectedIncarceratedCasesToday +=
          projection.projectedIncarceratedCases[index];
        tableData.projectedIncarceratedFatalitiesToday +=
          projection.projectedIncarceratedFatalities[index];
      }
    });
  }

  return {
    chartData,
    tableData,
  };
}

/**
 * Takes modelVersions for one facility and returns the 7 day projection for
 * for staff and incarcerated active cases
 *
 * @param modelVersions - An array of modelVersions for multiple facilities
 * @returns projectedCases - Array of projected staff/incarcerated cases a facility
 *
 */
function get7DayProjection(
  epidemicModelInputs: EpidemicModelInputs,
): ProjectedCases {
  const curveData = calculateCurveData(
    epidemicModelInputs,
    NEXT_SEVEN_DAYS_PROJECTION,
  );

  const zeroProjection = {
    projectedStaffCases: Array(NEXT_SEVEN_DAYS_PROJECTION).fill(0),
    projectedIncarceratedCases: Array(NEXT_SEVEN_DAYS_PROJECTION).fill(0),
  };

  if (!curveData) return zeroProjection;

  return {
    projectedStaffCases: getActiveCaseCount(curveData.staff),
    projectedIncarceratedCases: getActiveCaseCount(curveData.incarcerated),
  };
}

/**
 * Takes an array of modelVersions for multiple facilities and the locale data
 * and returns the total projected active cases for the next 7 days
 *
 * @param modelVersions - An array of modelVersions for multiple facilities
 * @param localeDataSource - LocaleData from the LocaleDataContext
 * @returns { incarcerated, staff } - Object with incarcerated/staff array of
 * 7 values for active cases for each bucket
 *
 */
export function get7DayProjectionChartData(
  modelVersions: ModelInputs[][],
  localeDataSource: LocaleData,
): { [key: string]: number[] } {
  const facilitiesProjections: ProjectedCases[] = getFacilitiesProjectionData(
    modelVersions,
    localeDataSource,
    today(),
    get7DayProjection,
  );

  let totalActiveIncarceratedCases = Array(NEXT_SEVEN_DAYS_PROJECTION).fill(0);
  let totalActiveStaffCases = Array(NEXT_SEVEN_DAYS_PROJECTION).fill(0);

  for (let index = 0; index < NEXT_SEVEN_DAYS_PROJECTION; index++) {
    facilitiesProjections.forEach((facility) => {
      totalActiveIncarceratedCases[index] +=
        facility.projectedIncarceratedCases[index];
      totalActiveStaffCases[index] += facility.projectedStaffCases[index];
    });
  }

  return {
    incarcerated: totalActiveIncarceratedCases,
    staff: totalActiveStaffCases,
  };
}
