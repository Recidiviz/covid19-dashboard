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
  font-size: 18px;
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
      // TODO: Replace this with create facility page path when ready
      history.push("/");
    }
  };

  return (
    <CreateBaselineScenarioPageContainer>
      <ModalDialog open title="Welcome">
        <ModalContent>
          <WelcomeText>
            Welcome to your new scenario. To get started, add in facility data
            on the right-hand side of the page. Your initial scenario is also
            your 'Baseline' - meaning this is where you should keep real-world
            numbers about the current state of your facilities, their cases, and
            mitigation steps. If you want to test the impact of proposed
            changes, duplicate your baseline scenario and make the changes in
            the new scenario - that way you can still compare them back to
            baseline.
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
