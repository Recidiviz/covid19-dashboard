import {
  countEverHospitalizedForDay,
  countUnableToWorkForDay,
  getFatalitiesForDay,
  maxByIndex,
} from "../../impact-dashboard/ImpactProjectionTableContainer";
import { CurveData, isCurveData } from "../../infection-model";

export function roundToPercent(percent: number): number {
  return Math.round(percent * 100);
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

    const staffUnableToWorkByDay = [];
    for (let i = 0; i < 90; i++) {
      staffUnableToWorkByDay.push(countUnableToWorkForDay(staffData, i));
    }
    staffUnableToWorkByDayByFacility.push(staffUnableToWorkByDay);
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
    staffUnableToWork: maxByIndex(staffUnableToWorkByDayByFacility),
  };
  return scenarioSum;
}
