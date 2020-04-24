import React from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";

import { createBaselineScenario } from "../database";
import Colors from "../design-system/Colors";
import InputButton from "../design-system/InputButton";
import ModalDialog from "../design-system/ModalDialog";

const CreateBaselineScenarioPageContainer = styled.div``;

const WelcomeText = styled.div`
  color: ${Colors.forest};
  font-family: "Poppins", sans serif;
  font-size: 16px;
  font-weight: normal;
  line-height: 180%;
  padding-top: 20px;
`;

const ModalFooter = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
  padding: 1em 0;
  width: 100%;
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1;
`;

const CreateBaselineScenarioPage: React.FC = () => {
  const history = useHistory();
  const handleOnClick = async () => {
    const baselineScenarioRef = await createBaselineScenario();
    if (baselineScenarioRef) {
      // Redirect to new facility page after exiting welcome modal
      history.push("/facility");
    }
  };

  return (
    <CreateBaselineScenarioPageContainer>
      <ModalDialog open title="Welcome">
        <ModalContent>
          <WelcomeText>
            This tool will help you model COVID-19 cases in a set of criminal
            justice facilities (jails or prisons), and provide a forecast of
            likely cases given your facility policies and populations. For more
            information and for a list of the corrections and epidemiology
            collaborators who made this model possible, see{" "}
            <a href="https://www.recidiviz.org/collaborators">
              recidiviz.org/collaborators
            </a>
            .
            <br />
            <br />
            To begin, we've created a 'Baseline Scenario' for you, where you can
            add your current facilities. Think of a 'Scenario' as you would a
            folder - it's just a collection of facilities that are being
            modeled. The 'Baseline' scenario is one you should keep as close to
            the real-world as possible. When you want to model something new (a
            policy change, for instance), you'll be able to make a copy of your
            baseline scenario, make the change there, and compare it to
            baseline. (Note: Creating multiple scenarios isn't ready just yet,
            but it will be available within the next few days.)
            <br />
            <br />
            If you have any questions or concerns, feel free to drop us a note
            at <a href="mailto:covid@recidiviz.org">covid@recidiviz.org</a>.
          </WelcomeText>
          <ModalFooter>
            <InputButton
              styles={{ width: "80px" }}
              label="Ok"
              onClick={handleOnClick}
            />
          </ModalFooter>
        </ModalContent>
      </ModalDialog>
    </CreateBaselineScenarioPageContainer>
  );
};

export default CreateBaselineScenarioPage;
