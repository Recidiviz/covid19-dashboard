import {
  countEverHospitalizedForDay,
  getFatalitiesForDay,
} from "../../impact-dashboard/ImpactProjectionTableContainer";
import { CurveData, isCurveData } from "../../infection-model";

export type reductionCardDataType = {
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
  origData: reductionCardDataType,
  currData: reductionCardDataType,
): reductionCardDataType {
  // positive value is a reduction
  return {
    incarcerated: {
      hospitalized: Math.abs(
        origData.incarcerated.hospitalized - currData.incarcerated.hospitalized,
      ),
      fatalities: Math.abs(
        origData.incarcerated.fatalities - currData.incarcerated.fatalities,
      ),
    },
    staff: {
      hospitalized: Math.abs(
        origData.staff.hospitalized - currData.staff.hospitalized,
      ),
      fatalities: Math.abs(
        origData.staff.fatalities - currData.staff.fatalities,
      ),
    },
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
  };
  return scenarioSum;
}
