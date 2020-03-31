export const seirBuckets = {
  susceptible: "susceptible",
  exposed: "exposed",
  infectious: "infectious",
  mild: "mild",
  severe: "severe",
  hospitalized: "hospitalized",
  mildRecovered: "mildRecovered",
  severeRecovered: "severeRecovered",
  fatalities: "fatalities",
};

export const seirIndex = {
  [seirBuckets.susceptible]: 0,
  [seirBuckets.exposed]: 1,
  [seirBuckets.infectious]: 2,
  [seirBuckets.mild]: 3,
  [seirBuckets.severe]: 4,
  [seirBuckets.hospitalized]: 5,
  [seirBuckets.mildRecovered]: 6,
  [seirBuckets.severeRecovered]: 7,
  [seirBuckets.fatalities]: 8,
};

function simulateOneDay({
  x,
  N,
  R0,
  dIncubation = 2,
  dInfectious = 4.1,
  dRecoveryMild = 9.9,
  dHospitalLag = 2.9,
  dHospitalRecovery = 22,
  dHospitalFatality = 8.3,
  pSevereCase = 0.26,
  pFatalityRate = 0.026,
}) {
  // Compute the updated SEIR values after 1 day
  // x: [1D array of integers] counts for the 9 SEIR (susceptible/exposed/infectious/recovered) values
  // N: [integer] population total per age bucket
  // R0: [float] rate of spread factor
  // D_incubation: [float] days from virus exposure to infectious/contagious state
  // D_infectious: [float] days in infectious period
  // D_recovery_mild: [float] days from end of infectious period to end of virus
  // D_hospital_lag: [float] days from end of infectious period to hospital admission
  // D_hospital_recovery: [integer] days from hospital admission to hospital release (non-fatality scenario)
  // D_hospital_fatality: [float] days from hospital admission to deceased (fatality scenario)
  // P_severe_case: [float] probability case will be severe enough for the hospital
  // P_fatality_rate: [float] probability of mortality per age bucket

  const alpha = 1 / dIncubation;
  const beta = R0 / dInfectious;
  const gamma = 1 / dInfectious;

  const pMildCase = 1 - pSevereCase;

  const [
    susceptible,
    exposed,
    infectious,
    mild,
    severe,
    hospitalized,
    mildRecovered,
    severeRecovered,
    fatalities,
  ] = x;

  // Compute the deltas from the bottom of the tree up, additions to the leaf nodes are subtracted from their parent node as people flow from the root to the leaves of the tree
  const mildRecoveredData = mild / dRecoveryMild;
  const fatalitiesDelta =
    ((pFatalityRate / pSevereCase) * hospitalized) / dHospitalFatality;
  const severeRecoveredDelta =
    ((1 - pFatalityRate / pSevereCase) * hospitalized) / dHospitalRecovery;

  const mildDelta = gamma * pMildCase * infectious - mild / dRecoveryMild;
  const severeDelta = gamma * pSevereCase * infectious - severe / dHospitalLag;
  const hospitalizedDelta =
    severe / dHospitalLag - fatalitiesDelta - severeRecoveredDelta;

  const infectiousDelta = alpha * exposed - gamma * infectious;

  // The transition from susceptible -> exposed depend on the total infectious population
  // TODO: calculate totalInfectious as a composite of different age groups
  const totalInfectious = infectious;

  let exposedDelta;
  let susceptibleDelta;
  if (N === 0) {
    exposedDelta = 0;
    susceptibleDelta = 0;
  } else {
    exposedDelta =
      Math.min(susceptible, (beta * totalInfectious * susceptible) / N) -
      alpha * exposed;
    susceptibleDelta = (-beta * totalInfectious * susceptible) / N;
  }

  return [
    Math.max(susceptible + susceptibleDelta, 0),
    exposed + exposedDelta,
    infectious + infectiousDelta,
    mild + mildDelta,
    severe + severeDelta,
    hospitalized + hospitalizedDelta,
    mildRecovered + mildRecoveredData,
    severeRecovered + severeRecoveredDelta,
    fatalities + fatalitiesDelta,
  ];
}

// based on an example from Justine, adapted from Python
export function getSEIRProjection({
  N,
  R0,
  I0 = 1, // initial infected population at day 1 of simulation
  // how far out we project
  numDays = 75,
}) {
  // inputs for the various SEIR stages; most of them are zero in our model at this point
  const initialSEIR = Array(9).fill(0);
  initialSEIR[seirIndex.susceptible] = N - I0;
  initialSEIR[seirIndex.infectious] = I0;

  const dailyProjections = [];

  let lastSEIR = initialSEIR;
  for (let i = 0; i < numDays; i += 1) {
    lastSEIR = simulateOneDay({ x: lastSEIR, N: N, R0 });
    dailyProjections.push(lastSEIR);
  }
  return dailyProjections;
}
