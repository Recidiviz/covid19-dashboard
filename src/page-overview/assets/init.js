import {
  getStateCodeFromName,
  registerRepaintFunction,
  repaint,
  setCurrentState,
  updateAppState,
} from "./data-forms";
import { Slider } from "./sliders";
import { initTooltips } from "./tooltip";

export function initOverviewPage() {
  // initialize
  setCurrentState("US");
  const r0Slider = new Slider("R0");
  registerRepaintFunction(r0Slider.updateValue);

  const incarceratedSlider = new Slider("incarcerated");
  registerRepaintFunction(incarceratedSlider.updateValue);

  // populate the page with initial data
  repaint();

  // -----------------------------------
  // event handlers
  // -----------------------------------

  initTooltips();

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
  $("#R0").on("input", function (e) {
    e.preventDefault();
    updateAppState({ R0: parseFloat(e.target.value) });
  });

  $("#incarcerated_population").on("input", function (e) {
    e.preventDefault();
    updateAppState({ incarceratedPopulation: parseInt(e.target.value) });
  });

  $("#state_name").on("input", function (e) {
    const name = $(e.target).text().trim();
    const code = getStateCodeFromName(name);
    code && setCurrentState(code);
  });
}
