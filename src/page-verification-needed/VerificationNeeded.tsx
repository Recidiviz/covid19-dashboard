import React from "react";
import styled from "styled-components";

import SiteHeader from "../components/site-header/SiteHeader";

const StyledButton = styled.button`
  background: #00615c;
  font-size: 16px;
  border-radius: 12px;
  color: white;
  font-family: "Poppins", sans-serif;
  height: 48px;
  width: 200px;
  outline: none;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const VerificationNeeded: React.FC = () => {
  const refreshAndNavigateAway = () => {
    window.location.href = "/";
  };

  return (
    <div>
      <div className="font-body text-green min-h-screen tracking-normal w-full">
        <div className="max-w-screen-xl px-4 mx-auto">
          <SiteHeader />
          <main className="py-8 sm:py-16 sm:py-24">
            <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-10 flex flex-col justify-start">
              <h1 className="text-2xl sm:text-3xl font-display text-left">
                Almost There
              </h1>
              <p className="leading-7 text-base sm:text-lg my-6">
                Look for a verification email in your inbox and click the link
                in that email. After you verify your email, click the button
                below and you will be able to reach the home page.
              </p>
              <ButtonWrapper className="leading-7 text-base sm:text-lg my-6">
                <StyledButton onClick={() => refreshAndNavigateAway()}>
                  Get started
                </StyledButton>
              </ButtonWrapper>
              <p className="leading-7 text-base sm:text-lg my-6">
                If you have reached this page by mistake, please try to log in
                again.
              </p>
              <p className="leading-7 text-base sm:text-lg">
                If you are still having trouble, please email{" "}
                <a
                  href="mailto:covid@recidiviz.org?Subject=Trouble%20logging%20in"
                  target="_top"
                >
                  covid@recidiviz.org
                </a>
                .
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default VerificationNeeded;
