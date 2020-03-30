$(document).ready(function () {
  // initialize
  setCurrentState("US");
  const infectedSlider = new Slider("infected");
  registerRepaintFunction(infectedSlider.updateValue);

  const incarceratedSlider = new Slider("incarcerated");
  registerRepaintFunction(incarceratedSlider.updateValue);

  // populate the page with initial data
  repaint();

  // -----------------------------------
  // event handlers
  // -----------------------------------

  // map interactions
  $("path.state, circle.state").click(function (e) {
    e.preventDefault();
    e.stopPropagation();
    setCurrentState(e.target.id);
  });

  $("#us_map").click(function (e) {
    e.preventDefault();
    e.stopPropagation();
    // reset state to US
    setCurrentState("US");
  });

  // form inputs
  $("#infected_percentage").on("input", function (e) {
    e.preventDefault();
    updateInfectedPct(+e.target.value);
  });

  $("#incarcerated_population").on("input", function (e) {
    e.preventDefault();
    updateAppState({ incarceratedPopulation: +e.target.value });
  });

  $("#state_name").on("input", function (e) {
    const name = $(e.target).text().trim();
    const code = getStateCodeFromName(name);
    code && setCurrentState(code);
  });
});
