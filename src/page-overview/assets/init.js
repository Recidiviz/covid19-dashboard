import {
  autoCompleteState,
  autoSuggestState,
  getStateCodeFromName,
  registerRepaintFunction,
  repaint,
  setCurrentState,
} from "./data-forms";
import { Slider } from "./sliders";
import { initTooltips } from "./tooltip";

export function initOverviewPage() {
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
  $("#infected_percentage").on("input", function (e) {
    e.preventDefault();
    updateInfectedPct(+e.target.value);
  });

  $("#incarcerated_population").on("input", function (e) {
    e.preventDefault();
    updateAppState({ incarceratedPopulation: +e.target.value });
  });

  $("#state_name")
    .on("focus", (e) => {
      // autoselect when entering the editable field
      let range = document.createRange();
      let sel = window.getSelection();
      range.selectNodeContents(e.target);
      sel.removeAllRanges();
      sel.addRange(range);
    })
    .on("input", function (e) {
      const name = $(e.target).text().trim();
      autoSuggestState(name);
      const code = getStateCodeFromName(name);
      code && setCurrentState(code);
    })
    .keydown((e) => {
      let complete = false;
      if (e.key === "Enter") {
        e.preventDefault();
        complete = true;
      }
      // don't prevent default on Tab so user can still navigate with it
      if (complete || e.key === "Tab") {
        const $input = $(e.target);
        const name = $input.text().trim();
        autoCompleteState(name, $input);
      }
    });
}
