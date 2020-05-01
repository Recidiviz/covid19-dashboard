import {
  countEverHospitalizedForDay,
  getFatalitiesForDay,
} from "../../impact-dashboard/ImpactProjectionTableContainer";
import { CurveData } from "../../infection-model";

export type releaseCardDataType = {
  original: {
    incarcerated: {
      hospitalized: number;
      fatalities: number;
    };
    staff: {
      hospitalized: number;
      fatalities: number;
    };
  };
  current: {
    incarcerated: {
      hospitalized: number;
      fatalities: number;
    };
    staff: {
      hospitalized: number;
      fatalities: number;
    };
  };
};

export function buildResponseImpactCardData(
  curveDataArr: CurveData[],
): releaseCardDataType {
  // will need to loop over original scenario AND current scenario
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
    // console.log("incarceratedHospitalized", incarceratedHospitalized);
    // console.log("incarceratedFatalities", incarceratedFatalities);
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
    // console.log("staffHospitalized", staffHospitalized);
    // console.log("staffFatalities", staffFatalities);
    // console.log("---");
    staffHospitalizedSum += staffHospitalized;
    staffFatalitiesSum += staffFatalities;
  });

  // after calculating Original scenario and Current scenario, populate data obj
  const releaseCardObj: releaseCardDataType = {
    original: {
      incarcerated: {
        hospitalized: 0,
        fatalities: 0,
      },
      staff: {
        hospitalized: 0,
        fatalities: 0,
      },
    },
    current: {
      incarcerated: {
        hospitalized: incarceratedHospitalizedSum,
        fatalities: incarceratedFatalitiesSum,
      },
      staff: {
        hospitalized: staffHospitalizedSum,
        fatalities: staffFatalitiesSum,
      },
    },
  };
  return releaseCardObj;
}
