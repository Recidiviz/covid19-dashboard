import {
  countEverHospitalizedForDay,
  getFatalitiesForDay,
} from "../../impact-dashboard/ImpactProjectionTableContainer";
import { CurveData } from "../../infection-model";

export type releaseCardDataType = {
  incarcerated: {
    hospitalized: number;
    fatalities: number;
  };
  staff: {
    hospitalized: number;
    fatalities: number;
  };
};

export function buildReductionData(
  origData: releaseCardDataType,
  currData: releaseCardDataType,
): releaseCardDataType {
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
  };
}

export function buildResponseImpactCardData(
  curveDataArr: CurveData[],
): releaseCardDataType {
  // for a given scenario, iterate over facilities and produce data for staff/inc. - hosp./fat.
  let incarceratedHospitalizedSum = 0;
  let incarceratedFatalitiesSum = 0;
  let staffHospitalizedSum = 0;
  let staffFatalitiesSum = 0;

  curveDataArr.forEach((data) => {
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
  });

  const scenarioSum: releaseCardDataType = {
    incarcerated: {
      hospitalized: incarceratedHospitalizedSum,
      fatalities: incarceratedFatalitiesSum,
    },
    staff: {
      hospitalized: staffHospitalizedSum,
      fatalities: staffFatalitiesSum,
    },
  };
  return scenarioSum;
}
