import React from "react";
import styled from "styled-components";

import SiteHeader from "../components/site-header/SiteHeader";

const UnsupportedBrowserPageDiv = styled.div``;

const UnsupportedBrowserPage: React.FC = () => (
  <UnsupportedBrowserPageDiv>
    <div className="font-body text-green min-h-screen tracking-normal w-full">
      <div className="max-w-screen-xl px-4 mx-auto">
        <SiteHeader />
        <main className="py-8 sm:py-16 sm:py-24">
          <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-10 flex flex-col justify-start">
            <p className="leading-7 text-base sm:text-lg my-6">
              We’re sorry, legacy browsers such as Internet Explorer are not
              currently supported by the COVID-19 model. Please try loading the
              website in a modern browser such as Microsoft Edge, Google Chrome,
              Firefox, or Safari.
            </p>
            <p className="leading-7 text-base sm:text-lg my-6">
              If you think you are seeing this message in error, or if you can’t
              switch browsers, please email us at{" "}
              <a
                href="mailto:covid@recidiviz.org?Subject=COVID%20Model%20Browser%20Support"
                className="font-semibold"
              >
                covid@recidiviz.org
              </a>{" "}
              so we can provide support.
            </p>
          </div>
        </main>
      </div>
    </div>
  </UnsupportedBrowserPageDiv>
);

export default UnsupportedBrowserPage;
