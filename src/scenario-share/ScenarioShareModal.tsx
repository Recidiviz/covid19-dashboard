import React, { useState } from "react";
import styled from "styled-components";

import InputButton from "../design-system/InputButton";
import InputText from "../design-system/InputText";
import Modal from "../design-system/Modal";
import { Spacer } from "../design-system/Spacer";
import useScenario from "../scenario-context/useScenario";
import ScenarioShareButton from "./ScenarioShareButton";

const ShareForm = styled.form`
  align-items: flex-end;
  display: flex;
  flex-direction: row;
`;

const buttonStyles: React.CSSProperties = {
  width: "78px",
  fontSize: "13px",
  fontWeight: "normal",
};

const ScenarioShareModal: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [scenario] = useScenario();
  const [emailAddress, setEmailAddress] = useState<string | undefined>();
  return (
    <Modal
      modalTitle={`Share ${scenario.data?.name}`}
      open={modalOpen}
      setOpen={setModalOpen}
      trigger={<ScenarioShareButton />}
      width="450px"
    >
      <Spacer y={30} />
      <ShareForm onSubmit={(e) => e.preventDefault()}>
        <InputText
          labelAbove="To:"
          onValueChange={setEmailAddress}
          valuePlaceholder="Email"
          type="email"
          valueEntered={emailAddress}
        />
        <Spacer x={8} />
        <InputButton label="Invite" styles={buttonStyles} />
      </ShareForm>
    </Modal>
  );
};

export default ScenarioShareModal;
