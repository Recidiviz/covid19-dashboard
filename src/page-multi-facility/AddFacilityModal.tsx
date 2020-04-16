import React, { useState } from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import InputButton from "../design-system/InputButton";
import Modal from "../design-system/Modal";
import ModalSteps from "../design-system/ModalSteps";

const AddFacilityModalContainer = styled.div``;

const ModalFooter = styled.div`
  border-top: 0.5px solid ${Colors.darkGray};
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  padding: 1em 0;
  width: 100%;
`;

const AddFacilityModal: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1);
  const numSteps = 3;

  const handleButtonClick = () => {
    if (activeStep < numSteps) {
      setActiveStep(activeStep + 1);
    }
  };

  return (
    <AddFacilityModalContainer className="text-3xl leading-none">
      <Modal modalTitle="Add Facility" trigger="+ Add Facilities">
        <ModalFooter>
          <ModalSteps activeStep={activeStep} numSteps={numSteps} />
          <InputButton
            styles={{ width: "80px" }}
            label="Next"
            onClick={handleButtonClick}
          />
        </ModalFooter>
      </Modal>
    </AddFacilityModalContainer>
  );
};

export default AddFacilityModal;
