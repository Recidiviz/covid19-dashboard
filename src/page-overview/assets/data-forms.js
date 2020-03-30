import { ICU_DATA } from "./icuData";

// application state object
export const appState = {
  percentageInfected: 100,
  stateCode: "",
  incarceratedPopulation: 0,
  incarceratedPopulationMax: 0,
  incarceratedPopulationMin: 0,
  R0: 3.0,
  R0Min: 0.0,
  R0Max: 4.0,
};

const repaintFunctions = [];

export function registerRepaintFunction(fn) {
  // these functions will all receive the state code as first argument,
  // so they should either use it or ignore it gracefully
  repaintFunctions.push(fn);
}

export function repaint() {
  const stateCode = appState.stateCode;
  repaintFunctions.forEach(function (fn) {
    fn(stateCode);
  });
}

const stateCodesByName = {};
Object.entries(ICU_DATA).forEach(function (entry) {
  const code = entry[0];
  const name = entry[1].name;
  stateCodesByName[name] = code;
});

export function updateAppState(changesObj) {
  Object.assign(appState, changesObj);
  // coerce user-input numbers to required precision
  appState.incarceratedPopulation = Math.round(
    parseInt(appState.incarceratedPopulation),
  );
  appState.R0 = parseFloat(appState.R0).toFixed(1);
  repaint();
}

export function getStateName(stateCode) {
  return ICU_DATA[stateCode].name;
}

export function getStateCodeFromName(name) {
  return stateCodesByName[name];
}

function getIncarceratedPopulation(stateCode) {
  return ICU_DATA[stateCode].incarceratedPopulation;
}

function getNumberOfICUBeds(stateCode) {
  return ICU_DATA[stateCode].numberOfICUBeds;
}

function getPercentageHospitalized() {
  // Returning a hard coded value for now, but you could replace this value with
  // something that is populated from a form element, such as a slider.
  return 0.05;
}

function getICUBedsProjection(stateCode) {
  // TODO: replace this with the real formula!!!!!!
  let incarceratedPopulation = appState.incarceratedPopulation;
  let numberOfICUBeds = getNumberOfICUBeds(stateCode);
  let percentageHospitalized = getPercentageHospitalized(stateCode);
  // TODO: this is extremely fake!!! it's just something that changes when you move the slider
  let percentageInfected = 0.25 * appState.R0;
  return {
    ICUBedsPercentage: parseInt(
      ((incarceratedPopulation * percentageInfected * percentageHospitalized) /
        numberOfICUBeds) *
        100,
    ),
    // TODO: this should be calculated by the new formula
    numDays: Math.round(30 * (appState.R0 ? 1 / appState.R0 : 0.1)),
  };
}

function paintHeading(stateCode) {
  let headingText;

  const projection = getICUBedsProjection(stateCode);

  if (stateCode == "US") {
    headingText = `As COVID-19 spreads, prisons and jails are the last dense gatherings in America.
      If states don't act now, ${projection.ICUBedsPercentage}% of ICU beds nationwide will be
      needed within ${projection.numDays} days just for the infirm from prisons and jails.`;
  } else {
    headingText = `If no action is taken, ${projection.ICUBedsPercentage}%
      of ${getStateName(stateCode)}’s ICU beds will be needed within
      ${projection.numDays} just for the infirm from prisons and jails.`;
  }

  $("#icu_heading").text(headingText);
}
registerRepaintFunction(paintHeading);

function paintIncarceratedPopulation() {
  const input = $("#incarcerated_population");
  input.val(appState.incarceratedPopulation);
  input.attr({
    min: appState.incarceratedPopulationMin,
    max: appState.incarceratedPopulationMax,
  });
}
registerRepaintFunction(paintIncarceratedPopulation);

function paintNumberOfICUBeds(stateCode) {
  $("#number_of_icu_beds").text(getNumberOfICUBeds(stateCode).toLocaleString());
}
registerRepaintFunction(paintNumberOfICUBeds);

function paintIncarceratedPct(stateCode) {
  $("#icu_percentage").text(
    getICUBedsProjection(stateCode).ICUBedsPercentage + "%",
  );
}
registerRepaintFunction(paintIncarceratedPct);

function paintStateName(stateCode) {
  $("#state_name").text(getStateName(stateCode));
}
registerRepaintFunction(paintStateName);

function paintR0() {
  const input = $("#R0");
  input.val(appState.R0);
  input.attr({
    min: appState.R0Min,
    max: appState.R0Max,
  });
}
registerRepaintFunction(paintR0);

function deselectState() {
  // deselect previous state, if any
  $("path.state, circle.state").removeClass("active");
}

export function setCurrentState(stateCode) {
  // fetch the base data from external file;
  const pop = getIncarceratedPopulation(stateCode);
  // because the population is user-editable we have to put it into app state
  updateAppState({
    stateCode,
    incarceratedPopulation: pop,
    // define valid input range according to base number
    incarceratedPopulationMin: Math.round(pop * 0.5),
    incarceratedPopulationMax: Math.round(pop * 1.5),
  });
  // visually select new state on the map
  deselectState();
  $("#" + stateCode).addClass("active");
}
