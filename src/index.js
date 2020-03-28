// application state object
const appState = {
  percentageInfected: 100,
  stateCode: "US"
};

function updateAppState(changesObj) {
  Object.assign(appState, changesObj);
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
  var incarceratedPopulation = getIncarceratedPopulation(stateCode);
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
  $("#incarcerated_population").text(
    getIncarceratedPopulation(stateCode).toLocaleString()
  );
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

function repaint() {
  const stateCode = appState.stateCode;
  paintHeading(stateCode);
  paintIncarceratedPopulation(stateCode);
  paintNumberOfICUBeds(stateCode);
  paintStateName(stateCode);
  paintIncarceratedPct(stateCode);
  paintInfectedPct();
}

$(document).ready(function() {
  // initialize
  repaint();

  // event handlers
  $("path.state, circle.state").hover(function(e) {
    updateAppState({ stateCode: e.target.id });
    repaint();
  });
  $("path.state, circle.state").mouseleave(function(e) {
    repaint();
  });

  $("#infected_percentage").on("input", function(e) {
    e.preventDefault();
    updateInfectedPct(e.target.value);
    repaint();
  });
});
