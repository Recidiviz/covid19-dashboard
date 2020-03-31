import styled from "styled-components";

import SiteHeader from "../site-header/SiteHeader";

const AboutPageDiv = styled.div`
  /* TODO: these are redundant with overview page, try to factor them out? */
  .font-display {
    font-family: "Poppins", sans-serif;
  }

  .font-body {
    font-family: "Rubik", sans-serif;
  }

  .font-7xl {
    font-size: 6rem;
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

  p,
  ol {
    letter-spacing: 0;
    font-family: "Rubik", sans-serif;
    line-height: 1.5;
    font-weight: normal;
  }
`;

const AboutPage: React.FC<{}> = () => (
  <AboutPageDiv>
    <div className="font-body text-green min-h-screen tracking-normal w-full">
      <div className="max-w-screen-xl px-4 mx-auto">
        <SiteHeader />
        <main className="py-8 sm:py-16 sm:py-24">
          <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-10 flex flex-col justify-start">
            <h1 className="text-2xl sm:text-3xl text-left font-display">Aim</h1>
            <p className="leading-7 text-base sm:text-lg my-6 font-body">
              Poor medical infrastructure and close quarters mean that jails and
              prisons are uniquely susceptible to the COVID-19 pandemic. Because
              the virus has already entered several facilities, state
              governments and corrections leaders need to act fast.{" "}
              <b>
                This isn’t just their problem; it’s everyone’s. Without proper
                action to control outbreak intensity, excess ICU beds across the
                country could be easily overwhelmed by hospitalized inmates{" "}
                <a href="/index.html">[see tool]</a>
              </b>
              .
            </p>
            <p className="leading-7 text-base sm:text-lg my-6 font-body">
              Recidiviz, in collaboration with X and Y, is standardizing and
              tracking those actions that state and county leaders across the
              country have taken to reduce populations and transmission rate.
              Why? Because we believe in transparency, and that knowing what’s
              happening where is helpful to those empowered to take action. In
              the coming days, we’ll add more data sources to this site intended
              to aid decision-makers understand what else they can do and what
              impact those decisions will have both now and in the long run for
              public health and criminal justice alike.
            </p>
            <h1 className="text-3xl mt-10 font-display text-left">
              What kind of actions?
            </h1>
            <p className="leading-7 text-base sm:text-lg my-6 font-body">
              Although some actions have already been taken to reduce
              populations and transmission rates, there’s always more to be
              done. Here’s some of what we’ve heard discussed by leaders
              nationwide:
            </p>
            <b>
              <ol className="list-decimal list-inside md:list-outside text-base sm:text-lg font-body">
                <li className="my-2">
                  Reducing facility intake by decreasing arrests, pre-trial
                  detention, and sentencing burden
                </li>
                <li className="my-2">
                  Promoting release from jails and prisons, as well as discharge
                  from parole and probation supervision
                </li>
                <li className="my-2">
                  Curtailing physical contact by reducing inmate density and
                  limiting exposure between inmates, supervisees, and others
                </li>
                <li className="my-2">
                  Guaranteeing healthcare guidance and treatment to both inmates
                  and staff
                </li>
                <li className="my-2">
                  Establishing trust and goodwill through wide and transparent
                  communication, preservation of inmate rights, and continuity
                  of safe routines to maintain inmate well-being
                </li>
              </ol>
            </b>
            <p className="leading-7 text-base sm:text-lg my-6 font-body">
              As we build out our site, we’ll collect data to display how states
              and counties are intervening to make sure that inmates &mdash; and
              all of us &mdash; are better off.
            </p>
          </div>
        </main>
      </div>
    </div>
  </AboutPageDiv>
);

export default AboutPage;
