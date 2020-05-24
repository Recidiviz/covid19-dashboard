import React from "react";
import styled from "styled-components";

import SiteHeader from "../components/site-header/SiteHeader";

const AboutPageDiv = styled.div`
  a {
    color: #25b894;
  }
`;

const AboutPage: React.FC = () => (
  <AboutPageDiv>
    <div className="font-body text-green min-h-screen tracking-normal w-full">
      <div className="max-w-screen-xl px-4 mx-auto">
        <SiteHeader />
        <main className="py-8 sm:py-16 sm:py-24">
          <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-10 flex flex-col justify-start">
            <h1 className="text-2xl sm:text-3xl text-left font-display">
              About
            </h1>
            <h2 className="text-xl text-left font-display font-normal mt-6 mb-3">
              What is this?
            </h2>
            <p className="leading-7 text-base sm:text-lg mb-6 font-body">
              This is an interactive model to allow criminal justice leaders and
              their staff to project the likely impact of COVID-19 within
              facilities. The charts and tables project how far into the future
              cases will peak in your facilities and how high that peak will be.
              It also forecasts hospital bed needs, and compares this to the
              number of hospital beds available in your region.
            </p>
            <p className="leading-7 text-base sm:text-lg mt-6 mb-0 font-body">
              If you have any questions, comments, or concerns about the model
              itself, check the FAQ section below. If you’re interested in
              getting custom analyses and reporting based on your jurisdiction’s
              data, or have additional questions we haven’t answered on the
              site, reach out to{" "}
              <a href="mailto:covid@recidiviz.org">covid@recidiviz.org</a> or
              schedule time with us{" "}
              <a
                href="https://calendly.com/covid19-cj/15min"
                target="_blank"
                rel="noopener noreferrer"
              >
                here
              </a>
              .
            </p>
            <h1
              className="text-2xl sm:text-3xl text-left font-display mt-10"
              id="definitions"
            >
              Definitions
            </h1>
            <ul className="list-disc list-inside md:list-outside text-base sm:text-lg font-body leading-normal">
              <li className="my-2">
                <span className="font-display">Current cases:</span> The
                cumulative number of confirmed COVID-19 cases. This includes
                anyone who has been exposed at any point, even if they have
                progressed towards larger stages, including hospitalization.
                Even recovered individuals are still considered “cases” any time
                after they’ve progressed from the “susceptible” bucket.
              </li>
              <li className="my-2">
                <span className="font-display">Exposed:</span> Residents and
                staff who have had contact with an individual positive for
                COVID-19 but are not yet spreading the virus to others.
              </li>
              <li className="my-2">
                <span className="font-display">Infectious:</span> Residents and
                staff who have been exposed to COVID-19 and are now capable of
                spreading it to other individuals.
              </li>
              <li className="my-2">
                <span className="font-display">Hospitalized:</span> Residents
                and staff who have been admitted to the hospital.
              </li>
              <li className="my-2">
                <span className="font-display">Fatalities:</span> Residents and
                staff who are casualties of COVID-19.
              </li>
              <li className="my-2">
                <span className="font-display">Staff unable to work:</span>{" "}
                Staff who are not reporting to work due to illness, whether or
                not they are hospitalized.
              </li>
            </ul>
            <h1
              className="text-2xl sm:text-3xl text-left font-display mt-10"
              id="methodology"
            >
              Methodology
            </h1>
            <p className="leading-7 text-base sm:text-lg mt-6 mb-0 font-body">
              <a
                href="https://docs.google.com/drawings/d/15_kbYlwO2rLBcII7ABUCDiBB_AoMIeCanaG2R5Wez2s/edit"
                target="_blank"
                rel="noopener noreferrer"
              >
                Please refer to this diagram
              </a>{" "}
              for the variables, assumptions, and sources.
            </p>
            <h1
              className="text-2xl sm:text-3xl text-left font-display mt-10"
              id="userGuides"
            >
              User Guides
            </h1>
            <ul className="list-disc list-inside md:list-outside text-base sm:text-lg font-body leading-normal">
              <li className="my-2">
                <a
                  href="https://docs.google.com/document/d/1Hfwjl7q9dLotR5ZZ203JSq5vGe8KDfeEDhE3GgjHA0U/edit"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Calculating Live Rate of Spread (Rt)
                </a>
              </li>
              <li className="my-2">
                <a
                  href="https://docs.google.com/document/d/1IuLVRI_BYbNHquiXh9yRJA-8B899T-Ee4qFAakddoQg/edit"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Generate Impact Report
                </a>
              </li>
            </ul>
            <h1 className="text-2xl sm:text-3xl text-left font-display mt-10">
              FAQ
            </h1>
            <h2 className="text-xl text-left font-display font-normal mt-6 mb-3">
              What makes this model different from the models I see online or in
              the news?
            </h2>
            <p className="leading-7 text-base sm:text-lg mb-6 font-body">
              This model is similar to models being used publicly, but factors
              in common criminal justice variables (population size and
              potential population releases). <br />
              <br />
              It also uses a rate of spread (R(t), the basic reproductive number
              which estimates the rate of an infection's spread) that is
              specific to prison and jail populations, where airborne illnesses
              spread at a significantly faster rate than is seen in the general
              population. See relevant academic work on the spread of similar
              illnesses in enclosed populations cited in the Methodology
              section.
            </p>
            <h2 className="text-xl text-left font-display font-normal mt-6 mb-3">
              Can I get help expanding this model to better fit my jail or
              prison system?
            </h2>
            <p className="leading-7 text-base sm:text-lg mb-6 font-body">
              Yes! You can set up a{" "}
              <a
                href="https://calendly.com/covid19-cj/15min"
                target="_blank"
                rel="noopener noreferrer"
              >
                consultation
              </a>{" "}
              with the team that produced this model - see{" "}
              <a href="https://www.recidiviz.org/covid">
                https://www.recidiviz.org/covid
              </a>
              . We can help build custom analysis or customized reports for your
              DOC.
            </p>
            <h2 className="text-xl text-left font-display font-normal mt-6 mb-3">
              Where can I learn more about how others in my field are preparing
              for COVID-19?
            </h2>
            <p className="leading-7 text-base sm:text-lg mb-6 font-body">
              Join the COVID-19 Criminal Justice community on Slack (see{" "}
              <a href="https://www.recidiviz.org/covid">
                https://www.recidiviz.org/covid
              </a>
              ). This is a community of criminal justice department leads and
              research staff sharing knowledge on how they're approaching the
              challenges posed by COVID-19.
            </p>
            <h2 className="text-xl text-left font-display font-normal mt-6 mb-3">
              How can I submit questions, concerns, or suggestions about the
              model?
            </h2>
            <p className="leading-7 text-base sm:text-lg mb-6 font-body">
              First, check the <a href="#methodology">Methodology</a>. If your
              issue is not addressed there, send any concerns about this model
              to <a href="mailto:covid@recidiviz.org">covid@recidiviz.org</a> or
              set up time with the Recidiviz team at{" "}
              <a href="https://www.recidiviz.org/covid">
                https://www.recidiviz.org/covid
              </a>
              . Recidiviz is a non-profit organization applying technology to
              issues in criminal justice, and maintains this model to help
              agencies anticipate and respond to the crisis.
              <br />
              <br />
              For general policy questions or suggestions, we'd recommend
              bringing them up in a space where other criminal justice agencies
              can contribute and build on your ideas—you'll find a #covid-model
              channel in the 'Criminal Justice C19' community on Slack (see{" "}
              <a href="https://www.recidiviz.org/covid">
                https://www.recidiviz.org/covid
              </a>
              ).
            </p>
            <h2 className="text-xl text-left font-display font-normal mt-6 mb-3">
              Can I make changes to this model, or re-share it with others?
            </h2>
            <p className="leading-7 text-base sm:text-lg mb-6 font-body">
              You can modify and re-share this model, so long as you keep the
              license notice in the Terms of Service unchanged. It ensures that
              others you pass the model along to also have the ability to modify
              and re-share.
            </p>
            <h2 className="text-xl text-left font-display font-normal mt-6 mb-3">
              What other guidelines or recommendations are available to prepare
              our system for COVID-19?
            </h2>
            <ul className="list-disc list-inside md:list-outside text-base sm:text-lg font-body leading-normal">
              <li className="my-2">
                <a
                  href="https://www.bop.gov/coronavirus/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  BOP: COVID-19 Resource Page
                </a>
              </li>
              <li className="my-2">
                <a
                  href="https://www.americanjail.org/content.asp?admin=Y&contentid=282"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  AJA: COVID-19 Resources
                </a>
              </li>
              <li className="my-2">
                <a
                  href="https://www.cdc.gov/coronavirus/2019-ncov/community/correction-detention/guidance-correctional-detention.html"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  CDC: Guidance on Management of Coronavirus (COVID-19) in
                  Correctional and Detention Facilities
                </a>
              </li>
            </ul>
            <h2 className="text-xl text-left font-display font-normal mt-6 mb-3">
              How can I help other criminal justice systems?
            </h2>
            <p className="leading-7 text-base sm:text-lg mb-6 font-body">
              The best way to help the rest of the community in real-time is to
              join the 'Criminal Justice C19' community on Slack (see{" "}
              <a href="https://www.recidiviz.org/covid">
                https://www.recidiviz.org/covid
              </a>
              ). This is a community of criminal justice department leads and
              research staff sharing knowledge on how they're approaching the
              challenges posed by COVID-19.
            </p>
            <h1 className="text-2xl sm:text-3xl text-left font-display mt-10">
              Contact us
            </h1>
            <p className="leading-7 text-base sm:text-lg my-6 font-body">
              Questions? Feedback? Need help refining this model or fitting it
              to your system? Reach out to{" "}
              <a href="mailto:covid@recidiviz.org">covid@recidiviz.org</a> or
              set up a 15m consultation with the team{" "}
              <a
                href="https://calendly.com/covid19-cj/15min"
                target="_blank"
                rel="noopener noreferrer"
              >
                here
              </a>{" "}
              and we’ll add you to the community.
            </p>
            <h1
              className="text-2xl sm:text-3xl text-left font-display mt-10"
              id="termsOfService"
            >
              Terms of Service
            </h1>
            <p className="leading-7 text-base sm:text-lg my-6 font-body">
              COVID-19 Incarceration Model
              <br />
              Copyright (C) 2020 Recidiviz Inc.
            </p>
            <p className="leading-7 text-base sm:text-lg my-6 font-body">
              This program is free software: you can redistribute it and/or
              modify it under the terms of the GNU General Public License as
              published by the Free Software Foundation, either version 3 of the
              License, or (at your option) any later version. This model is
              distributed in the hope that it will be useful, but WITHOUT ANY
              WARRANTY; without even the implied warranty of MERCHANTABILITY or
              FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
              License for more details. For a copy of the GNU General Public
              License v3, see{" "}
              <a
                href="https://www.gnu.org/licenses/"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://www.gnu.org/licenses/
              </a>
              .{" "}
            </p>
          </div>
        </main>
      </div>
    </div>
  </AboutPageDiv>
);

export default AboutPage;
