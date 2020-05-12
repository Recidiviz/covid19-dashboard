import styled from "styled-components";

import Colors from "../../design-system/Colors";
import {
  countEverHospitalizedForDay,
  countUnableToWorkForDay,
  getFatalitiesForDay,
  getHospitalizedForDay,
} from "../../impact-dashboard/ImpactProjectionTableContainer";
import { CurveData, isCurveData } from "../../infection-model";
import { calculatePercentDiff } from "./numberUtils";

export function maxByIndex(twoDimensionalArray: number[][]) {
  let sumByIndex = [];
  for (let i = 0; i < 90; i++) {
    sumByIndex.push(
      twoDimensionalArray.reduce((sum, data) => {
        return sum + data[i];
      }, 0),
    );
  }
  return Math.max(...sumByIndex);
}

export type PopulationImpact = {
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

export type ImpactTitleProps = {
  title: string;
  value: number;
};

export const ImpactTitleSpan = styled.span`
  color: ${(props) => props.color || Colors.teal};
`;

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
    staffUnableToWork: origData.staffUnableToWork - currData.staffUnableToWork,
    hospitalBedsUsed: calculatePercentDiff(
      origData.hospitalBedsUsed,
      currData.hospitalBedsUsed,
    ),
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
  let staffUnableToWorkByFacility: number[][] = [];
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
    staffUnableToWorkByFacility.push(staffUnableToWorkByDay);
    hospitalBedsUsedByFacility.push(hospitalBedsUsedByDay);
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
    staffUnableToWork: maxByIndex(staffUnableToWorkByFacility),
    hospitalBedsUsed: maxByIndex(hospitalBedsUsedByFacility),
  };
  return scenarioSum;
}
