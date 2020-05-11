import {
  countEverHospitalizedForDay,
  countUnableToWorkForDay,
  getFatalitiesForDay,
  getHospitalizedForDay,
} from "../../impact-dashboard/ImpactProjectionTableContainer";
import { CurveData, isCurveData } from "../../infection-model";

export function roundToPercent(percent: number): number {
  return Math.round(percent * 100);
}

export function maxByDay(twoDimensionalArray: number[][]) {
  let sumByIndex = [];
  for (let i = 0; i < 90; i++) {
    sumByIndex.push(
      twoDimensionalArray.reduce((sum, data) => {
        sum += data[i];
        return sum;
      }, 0),
    );
  }
  return Math.max(...sumByIndex);
}

export type reductionCardDataType = {
  incarcerated: {
    hospitalized: number;
    fatalities: number;
  };
  staff: {
    hospitalized: number;
    fatalities: number;
  };
  staffUnableToWork: number;
  hospitalBedsUsed: number;
};

export function buildReductionData(
  origData: reductionCardDataType,
  currData: reductionCardDataType,
): reductionCardDataType {
  // positive value is a reduction
  return {
    incarcerated: {
      hospitalized:
        -1 *
        (currData.incarcerated.hospitalized -
          origData.incarcerated.hospitalized),
      fatalities:
        -1 *
        (currData.incarcerated.fatalities - origData.incarcerated.fatalities),
    },
    staff: {
      hospitalized:
        -1 * (currData.staff.hospitalized - origData.staff.hospitalized),
      fatalities: -1 * (currData.staff.fatalities - origData.staff.fatalities),
    },
    staffUnableToWork:
      -1 * (currData.staffUnableToWork - origData.staffUnableToWork),
    hospitalBedsUsed:
      origData.hospitalBedsUsed &&
      (-1 * (currData.hospitalBedsUsed - origData.hospitalBedsUsed)) /
        origData.hospitalBedsUsed,
  };
}

export function buildResponseImpactCardData(
  curveDataArr: (CurveData | undefined)[],
): reductionCardDataType {
  // for a given scenario, iterate over facilities and produce data for staff/inc. - hosp./fat.
  let incarceratedHospitalizedSum = 0;
  let incarceratedFatalitiesSum = 0;
  let staffHospitalizedSum = 0;
  let staffFatalitiesSum = 0;
  let staffUnableToWorkByDayByFacility: number[][] = [];
  let hospitalBedsUsedByFacility: number[][] = [];

  curveDataArr.filter(isCurveData).forEach((data) => {
    const incarceratedData = data.incarcerated;
    const staffData = data.staff;

    const incarceratedHospitalized = countEverHospitalizedForDay(
      incarceratedData,
      incarceratedData.shape[0] - 1,
    );
    const incarceratedFatalities = getFatalitiesForDay(
      incarceratedData,
      incarceratedData.shape[0] - 1,
    );
    incarceratedHospitalizedSum += incarceratedHospitalized;
    incarceratedFatalitiesSum += incarceratedFatalities;

    const staffHospitalized = countEverHospitalizedForDay(
      staffData,
      staffData.shape[0] - 1,
    );
    const staffFatalities = getFatalitiesForDay(
      staffData,
      staffData.shape[0] - 1,
    );
    staffHospitalizedSum += staffHospitalized;
    staffFatalitiesSum += staffFatalities;

    let staffUnableToWorkByDay = [];
    let hospitalBedsUsedByDay = [];
    for (let i = 0; i < 90; i++) {
      staffUnableToWorkByDay.push(countUnableToWorkForDay(staffData, i));
      hospitalBedsUsedByDay.push(getHospitalizedForDay(incarceratedData, i));
    }
    staffUnableToWorkByDayByFacility.push(staffUnableToWorkByDay);
    hospitalBedsUsedByFacility.push(hospitalBedsUsedByDay);
  });

  const scenarioSum: reductionCardDataType = {
    incarcerated: {
      hospitalized: incarceratedHospitalizedSum,
      fatalities: incarceratedFatalitiesSum,
    },
    staff: {
      hospitalized: staffHospitalizedSum,
      fatalities: staffFatalitiesSum,
    },
    staffUnableToWork: maxByDay(staffUnableToWorkByDayByFacility),
    hospitalBedsUsed: maxByDay(hospitalBedsUsedByFacility),
  };
  return scenarioSum;
}
