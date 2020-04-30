import { zip } from "d3-array";
import ndarray from "ndarray";

import {
  calculateCurves,
  CurveData,
  CurveFunctionInputs,
} from "../infection-model";
import { getAllValues, getColView } from "../infection-model/matrixUtils";
import { seirIndex } from "../infection-model/seir";

function calculateCurveData(facilitiesInputs: CurveFunctionInputs[]) {
  return facilitiesInputs.map((facilityInput) => {
    return calculateCurves(facilityInput);
  });
}

function combineFacilitiesProjectionData(
  facilitiesProjectionData: CurveData[],
) {
  if (!facilitiesProjectionData.length) return ndarray([], []);
  const incarceratedData = facilitiesProjectionData.map(
    (output) => output.incarcerated.data,
  );
  const staffData = facilitiesProjectionData.map((output) => output.staff.data);
  const combinedData = zip(...incarceratedData, ...staffData);
  const summedData = combinedData.map((row) => {
    return row.reduce((sum, value) => {
      return (sum += value);
    }, 0);
  });
  return ndarray(summedData, [90, 9]);
}

export function getCurveChartData(facilitiesInputs: CurveFunctionInputs[]) {
  if (!facilitiesInputs.length)
    return {
      // NOTE: We should guard against this in the dashboard and remove
      // this default return from this function
      exposed: [],
      fatalities: [],
      hospitalized: [],
      infectious: [],
    };
  const facilitiesProjectionData = calculateCurveData(facilitiesInputs);
  const combinedData: ndarray = combineFacilitiesProjectionData(
    facilitiesProjectionData,
  );
  return {
    exposed: getAllValues(getColView(combinedData, seirIndex.exposed)),
    fatalities: getAllValues(getColView(combinedData, seirIndex.fatalities)),
    hospitalized: getAllValues(
      getColView(combinedData, seirIndex.hospitalized),
    ),
    infectious: getAllValues(getColView(combinedData, seirIndex.infectious)),
  };
}
