import Colors from "../../design-system/Colors";
import {
  countEverHospitalizedForDay,
  getFatalitiesForDay,
} from "../../impact-dashboard/ImpactProjectionTableContainer";
import { CurveData, isCurveData } from "../../infection-model";

export type PopulationImpact = {
  incarcerated: {
    hospitalized: number;
    fatalities: number;
  };
  staff: {
    hospitalized: number;
    fatalities: number;
  };
};

export function getSubtitle(valueSign: number) {
  switch (valueSign) {
    case 1:
      return {
        text: "reduced by",
        color: Colors.teal,
      };
    case -1:
      return {
        text: "increased by",
        color: Colors.darkRed,
      };
    default:
      return {
        text: "changed by",
        color: Colors.forest,
      };
  }
}

export function calculatePopulationImpactDifference(
  origData: PopulationImpact,
  currData: PopulationImpact,
): PopulationImpact {
  return {
    incarcerated: {
      hospitalized:
        origData.incarcerated.hospitalized - currData.incarcerated.hospitalized,
      fatalities:
        origData.incarcerated.fatalities - currData.incarcerated.fatalities,
    },
    staff: {
      hospitalized: origData.staff.hospitalized - currData.staff.hospitalized,
      fatalities: origData.staff.fatalities - currData.staff.fatalities,
    },
  };
}

export function sumPopulationImpactAcrossFacilities(
  curveDataArr: (CurveData | undefined)[],
): PopulationImpact {
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

  const scenarioSum: PopulationImpact = {
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
