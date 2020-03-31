import { getSEIRProjection, seirBuckets, seirIndex } from "./seir";

export function getCurveData({
  N,
  R0,
  subsets = [
    seirBuckets.exposed,
    seirBuckets.infectious,
    seirBuckets.hospitalized,
  ],
} = {}) {
  const projection = getSEIRProjection({ N, R0 });
  const curves = {};
  subsets.forEach((subsetName) => {
    curves[subsetName] = projection.map((day) => day[seirIndex[subsetName]]);
  });
  return curves;
}

export function estimatePeakHospitalUse({
  incarceratedPopulation,
  R0,
  hospitalBedCapacity,
}) {
  const bedsRequiredPerDay = getCurveData({
    N: incarceratedPopulation,
    subsets: [seirBuckets.hospitalized],
    R0,
  }).hospitalized;
  const peakRequirement = Math.max(...bedsRequiredPerDay);
  const peakUtilization = peakRequirement / hospitalBedCapacity;
  const peakDay = bedsRequiredPerDay.indexOf(peakRequirement) + 1;
  return { peakUtilization, peakDay };
}
