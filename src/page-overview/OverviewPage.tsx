import { useEffect } from "react";
import styled from "styled-components";

import GlobalNav from "../global/GlobalNav";
import OverviewMap from "./OverviewMap";

const { initOverviewPage } = require("./assets/init") as any;

const Main = styled.main`
  /* Add CSS for the overview page here! */

  #us_map {
    cursor: pointer;

    .state {
      fill: #d6dddd;
    }
  }

  path.state.active,
  path.state.active:hover,
  circle.state.active,
  circle.state.active:hover {
    stroke: #83a1a0 !important;
    stroke-width: 2px;
    stroke-linejoin: round;
    fill: #83a1a0 !important;
  }

  path.state:hover,
  circle.state:hover {
    stroke: #c3d1d1 !important;
    stroke-width: 2px;
    stroke-linejoin: round;
    fill: #c3d1d1 !important;
  }

  .font-display {
    font-family: "Poppins", sans-serif;
  }

  .font-body {
    font-family: "Rubik", sans-serif;
  }

  .font-7xl {
    font-size: 6rem;
  }

  .background-gray {
    background-color: #e9ecec;
  }

  .text-green {
    color: #00413e;
  }

  .border-green {
    border-color: #00413e;
  }

  .text-green-light {
    color: #25b895;
  }

  .text-teal {
    color: #006c67;
  }

  .text-teal-light {
    color: #a7d1de;
  }

  .text-red {
    color: #de5558;
  }

  .text-red-light {
    color: #efb5b7;
  }

  .border-current {
    border-color: currentColor;
  }

  .w-28 {
    width: 6.5rem;
  }

  .map-tooltip {
    position: absolute;
    background-color: #00413e;
    color: #fff;
    border-radius: 0.25rem;
    padding: 0.5rem;
    font-size: 0.75rem;
    font-weight: 400;
  }
`;

const OverviewPage: React.FC<{}> = () => {
  useEffect(() => {
    initOverviewPage();

    return function cancel() {
      // TODO: For performance reasons, we should be unsetting all of the jQuery
      // handlers when the component is unmounted. That code should go here.
    };
  }, []);

  return (
    <div>
      <div className="background-gray font-body text-green min-h-screen tracking-normal">
        <GlobalNav.Header />
        <Main className="py-4 sm:py-6 flex justify-between items-start container mx-auto">
          <div className="w-3/5">
            <div className="my-6">
              <div id="infected_slider" className="w-11/12 mx-auto" />
              <div
                id="map_and_text_container"
                className="flex justify-center items-center"
              >
                <div className="w-28 text-center flex-shrink-0 font-display">
                  <p className="text-base sm:leading-6 font-light text-teal tracking-normal">
                    Incarcerated
                  </p>
                  <div>
                    <input
                      type="number"
                      id="incarcerated_population"
                      className="border-b block w-full bg-transparent text-center my-2 text-2xl leading-8 border-current text-teal"
                      required
                    />
                  </div>
                </div>
                <OverviewMap />
                <div className="w-28 text-center flex-shrink-0">
                  <label
                    className="text-base sm:leading-6 font-light text-red tracking-normal"
                    htmlFor="infected_percentage"
                  >
                    % Infected
                  </label>
                  <div>
                    <input
                      type="number"
                      id="infected_percentage"
                      className="border-b block w-full bg-transparent text-center my-2 text-2xl leading-8 border-current text-red"
                      min="0"
                      max="100"
                      required
                    />
                  </div>
                </div>
              </div>
              <div id="incarcerated_slider" className="w-11/12 mx-auto" />
            </div>
          </div>
          <div className="w-1/4 mr-12 mt-56">
            <h1
              id="icu_percentage"
              className="font-7xl leading-none font-display font-semibold text-left"
            />
            <h2 className="text-lg mb-2 whitespace-no-wrap font-display font-light leading-normal">
              ICU Beds Occupied in{" "}
              <span className="inline-block relative cursor-pointer">
                <span
                  id="state_name_autocomplete"
                  className="absolute h-full block text-green-light border-b top-0 left-0 z-0"
                />

                <span
                  id="state_name"
                  className="border-b border-current relative z-10 inline"
                  contentEditable
                />
              </span>
            </h2>
            <p
              id="icu_heading"
              className="text-base font-body tracking-normal leading-normal font-normal"
            />
          </div>
        </Main>
        <GlobalNav.Footer />
        <div id="map_tooltip" className="map-tooltip hidden" />
      </div>
    </div>
  );
};

export default OverviewPage;
