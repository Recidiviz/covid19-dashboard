// application state object
const appState = {
  percentageInfected: 100,
  stateCode: "",
  incarceratedPopulation: 0,
  incarceratedPopulationMax: 0,
  incarceratedPopulationMin: 0
};

function updateAppState(changesObj) {
  Object.assign(appState, changesObj);
  repaint();
}

function getStateName(stateCode) {
  return ICU_DATA[stateCode].name;
}

function getIncarceratedPopulation(stateCode) {
  return ICU_DATA[stateCode].incarceratedPopulation;
}

function getNumberOfICUBeds(stateCode) {
  return ICU_DATA[stateCode].numberOfICUBeds;
}

function getPercentageHospitalized(stateCode) {
  // Returning a hard coded value for now, but you could replace this value with
  // something that is populated from a form element, such as a slider.
  return 0.05;
}

function getPercentageInfectedAsDecimal() {
  return appState.percentageInfected / 100;
}

function getICUBedsPercentage(stateCode) {
  var incarceratedPopulation = appState.incarceratedPopulation;
  var numberOfICUBeds = getNumberOfICUBeds(stateCode);
  var percentageHospitalized = getPercentageHospitalized(stateCode);
  var percentageInfected = getPercentageInfectedAsDecimal();

  return parseInt(
    ((incarceratedPopulation * percentageInfected * percentageHospitalized) /
      numberOfICUBeds) *
      100
  );
}

function paintHeading(stateCode) {
  var headingText;

  if (stateCode == "US") {
    headingText =
      "As COVID-19 spreads, prisons and jails are the last dense gatherings in America. " +
      "If states don't act now, 120% of ICU beds nationwide will be needed just for the " +
      "infirm from prisons and jails.";
  } else {
    headingText =
      "If no action is taken, " +
      getICUBedsPercentage(stateCode) +
      "% of " +
      getStateName(stateCode) +
      "’s ICU beds will be needed just for the infirm from prisons and jails.";
  }

  $("#icu_heading").text(headingText);
}

function paintIncarceratedPopulation(stateCode) {
  const input = $("#incarcerated_population");
  input.val(appState.incarceratedPopulation);
  input.attr({
    min: appState.incarceratedPopulationMin,
    max: appState.incarceratedPopulationMax
  });
}

function paintNumberOfICUBeds(stateCode) {
  $("#number_of_icu_beds").text(getNumberOfICUBeds(stateCode).toLocaleString());
}

function paintIncarceratedPct(stateCode) {
  $("#icu_percentage").text(getICUBedsPercentage(stateCode) + "%");
}

function paintStateName(stateCode) {
  $("#state_name").text(getStateName(stateCode));
}

function updateInfectedPct(val) {
  updateAppState({ percentageInfected: val });
}

function paintInfectedPct() {
  $("#infected_percentage").val(appState.percentageInfected);
}

function setCurrentState(stateCode) {
  // fetch the base data from external file;
  const pop = getIncarceratedPopulation(stateCode);
  // because the population is user-editable we have to put it into app state
  updateAppState({
    stateCode,
    incarceratedPopulation: pop,
    // define valid input range according to base number
    incarceratedPopulationMin: Math.round(pop * 0.5),
    incarceratedPopulationMax: Math.round(pop * 1.5)
  });
}

function repaint() {
  const stateCode = appState.stateCode;
  paintHeading(stateCode);
  paintIncarceratedPopulation(stateCode);
  paintNumberOfICUBeds(stateCode);
  paintStateName(stateCode);
  paintIncarceratedPct(stateCode);
  paintInfectedPct();
}

function deselectState() {
  // deselect previous state, if any
  $("path.state, circle.state").removeClass("active");
}

$(document).ready(function() {
  // initialize
  setCurrentState("US");
  repaint();

  // -----------------------------------
  // event handlers
  // -----------------------------------

  // map interactions
  $("path.state, circle.state").click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    deselectState();
    // select new state
    $(e.target).addClass("active");
    // propagate new data
    setCurrentState(e.target.id);
  });

  $("#us_map").click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    // reset state to US
    deselectState();
    // propagate new data
    setCurrentState("US");
  });

  // form inputs
  $("#infected_percentage").on("input", function(e) {
    e.preventDefault();
    updateInfectedPct(+e.target.value);
  });

  $("#incarcerated_population").on("input", function(e) {
    e.preventDefault();
    updateAppState({ incarceratedPopulation: +e.target.value });
  });
});
