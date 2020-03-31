import { estimatePeakHospitalUse } from "../../infection-model";
import { populationAndHospitalData } from "./dataSource";

// application state object
export const appState = {
  percentageInfected: 100,
  stateCode: "",
  incarceratedPopulation: 0,
  incarceratedPopulationMax: 0,
  incarceratedPopulationMin: 0,
  R0: 3.7,
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

const stateNames = Object.values(populationAndHospitalData).map(function (
  record,
) {
  return record.name;
});

const stateCodesByName = {};
Object.entries(populationAndHospitalData).forEach(function (entry) {
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
  return populationAndHospitalData[stateCode].name;
}

export function getStateCodeFromName(name) {
  return stateCodesByName[name];
}

function getIncarceratedPopulation(stateCode) {
  return populationAndHospitalData[stateCode].incarceratedPopulation;
}

function getHospitalBeds(stateCode) {
  return populationAndHospitalData[stateCode].hospitalBeds;
}

function getPeakHospitalUse(stateCode) {
  const incarceratedPopulation = appState.incarceratedPopulation;
  const hospitalBedCapacity = getHospitalBeds(stateCode);
  const R0 = appState.R0;
  const { peakDay, peakUtilization } = estimatePeakHospitalUse({
    hospitalBedCapacity,
    incarceratedPopulation,
    R0,
  });
  return { peakDay, peakUtilization: Math.round(peakUtilization * 100) };
}

function paintHeading(stateCode) {
  let headingText;

  const { peakDay, peakUtilization } = getPeakHospitalUse(stateCode);

  if (stateCode == "US") {
    headingText = `As COVID-19 spreads, prisons and jails are the last dense
      gatherings in America. If states don't act now, ${peakUtilization}% of
      hospital beds nationwide will be needed within ${peakDay} days just for the
      infirm from prisons and jails.`;
  } else {
    headingText = `If no action is taken, ${peakUtilization}%
      of ${getStateName(stateCode)}’s hospital beds will be needed within
      ${peakDay} days just for the infirm from prisons and jails.`;
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

function paintIncarceratedPct(stateCode) {
  $("#icu_percentage").text(
    getPeakHospitalUse(stateCode).peakUtilization + "%",
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
    incarceratedPopulationMax: Math.round(pop * 1.1),
  });
  // visually select new state on the map
  deselectState();
  $("#" + stateCode).addClass("active");
}

function getSuggestedState(text) {
  return text && stateNames.find((stateName) => stateName.indexOf(text) === 0);
}

function clearAutoSuggest() {
  $("#state_name_autocomplete").html("");
}
registerRepaintFunction(clearAutoSuggest);

export function autoSuggestState(text) {
  const suggestion = getSuggestedState(text);
  const $autoCompleteEl = $("#state_name_autocomplete");
  suggestion ? $autoCompleteEl.html(suggestion) : clearAutoSuggest();
}

export function autoCompleteState(text, $target) {
  const suggestion = getSuggestedState(text);
  suggestion && $target.html(suggestion);
  // trigger input event so new data gets handled
  $target.trigger("input");
}
