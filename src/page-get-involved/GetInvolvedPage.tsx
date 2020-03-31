import styled from "styled-components";

import SiteHeader from "../site-header/SiteHeader";

const GetInvolvedPageDiv = styled.div`
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
  <GetInvolvedPageDiv>
    <div className="font-body text-green min-h-screen tracking-normal w-full">
      <div className="max-w-screen-xl px-4 mx-auto">
        <SiteHeader />
        <main className="py-8 sm:py-16 sm:py-24">
          <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-10 flex flex-col justify-start">
            <h1 className="text-2xl sm:text-3xl font-display text-left">
              Get Involved
            </h1>
            <p className="leading-7 text-base sm:text-lg my-6">
              Questions? Feedback? Need help refining this model or fitting it
              to your system? Join the &ldquo;Criminal Justice C19&rdquo;
              community on Slack. This is a private community of criminal
              justice agency leaders and research staff sharing knowledge on how
              they&apos;re approaching the challenges posed by COVID-19.
            </p>
            <p className="leading-7 text-base sm:text-lg my-6">
              To join, send an email to{" "}
              <a href="mailto:covid@recidiviz.org" className="font-semibold">
                covid@recidiviz.org
              </a>{" "}
              with the subject line &ldquo;Join the Conversation&rdquo;.
            </p>
            <p className="leading-7 text-base sm:text-lg my-6">
              Need help? Set up a 15m consultation with the team{" "}
              <a
                href="https://calendly.com/covid-cj/model"
                className="font-semibold"
                target="_blank"
                rel="noopener noreferrer"
              >
                here
              </a>{" "}
              and we’ll add you to the community.
            </p>
            <p className="leading-7 text-base sm:text-lg my-6">
              If you would like to contribute to ongoing iterations of this
              tool, please fill out{" "}
              <a
                href="https://forms.gle/wBzpqA2cEqkwM6ou6"
                className="font-semibold"
                target="_blank"
                rel="noopener noreferrer"
              >
                this form
              </a>
              .
            </p>
          </div>
        </main>
      </div>
    </div>
  </GetInvolvedPageDiv>
);

export default AboutPage;
