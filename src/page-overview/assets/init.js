import ResizeObserver from "resize-observer-polyfill";

import {
  autoCompleteState,
  autoSuggestState,
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

  // adjust map based on container size
  const $map = $("#us_map");
  const observeMapContainerSize = new ResizeObserver((entries) => {
    const maxWidth = 500;

    for (let entry of entries) {
      // redraw sliders on resize
      r0Slider.draw();
      incarceratedSlider.draw();
      const { width } = entry.contentRect;
      if (width < maxWidth) {
        $map.addClass("hidden");
      } else {
        $map.removeClass("hidden");
      }
    }
  });
  observeMapContainerSize.observe(
    document.getElementById("map_and_text_container"),
  );
}
