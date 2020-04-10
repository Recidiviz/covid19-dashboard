import styled from "styled-components";

import SiteHeader from "../site-header/SiteHeader";

const GetInvolvedPageDiv = styled.div``;

const UnsupportedBrowserPage: React.FC = () => (
  <GetInvolvedPageDiv>
    <div className="font-body text-green min-h-screen tracking-normal w-full">
      <div className="max-w-screen-xl px-4 mx-auto">
        <SiteHeader />
        <main className="py-8 sm:py-16 sm:py-24">
          <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-10 flex flex-col justify-start">
            <p className="leading-7 text-base sm:text-lg my-6">
              Sorry, you're using a legacy browser that that site does not
              support.
            </p>
            <p className="leading-7 text-base sm:text-lg my-6">
              Please use Google Chrome, Firefox, Microsoft Edge, or any other
              modern browser.
            </p>
            <p className="leading-7 text-base sm:text-lg my-6">
              If you have further issues, please email us at{" "}
              <a href="mailto:covid@recidiviz.org" className="font-semibold">
                covid@recidiviz.org
              </a>
              .
            </p>
          </div>
        </main>
      </div>
    </div>
  </GetInvolvedPageDiv>
);

export default UnsupportedBrowserPage;
