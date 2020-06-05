import { navigate } from "gatsby";
import React, { useState } from "react";
import styled from "styled-components";

import { saveScenario, SCENARIO_DEFAULTS } from "../database";
import Colors from "../design-system/Colors";
import iconAddSquare from "../design-system/icons/ic_add_square.svg";
import InputButton from "../design-system/InputButton";
import InputText from "../design-system/InputText";
import InputTextArea from "../design-system/InputTextArea";
import Modal from "../design-system/Modal";
import useScenario from "../scenario-context/useScenario";

const AddScenarioCard = styled.div`
  background: ${Colors.gray};
  border: 1px solid ${Colors.gray};
  border-radius: 0.25em;
  cursor: pointer;
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 330px;
  width: 330px;
`;

const AddScenarioCTA = styled.div`
  color: ${Colors.opacityForest};
  font-family: "Poppins";
  font-size: 13px;
  line-height: 20px;
  letter-spacing: -0.03em;
  min-height: 18%;
  padding: 2rem 2rem 0rem 2rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const IconAddSquare = styled.img`
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 50px;
  height: 50px;
`;

const ScenarioForm = styled.form`
  padding-top: 1rem;
`;

const buttonStyles: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: "normal",
  width: "78px",
};

const CreateNewScenarioModal: React.FC = () => {
  const [showCreateScenarioModal, setShowCreateScenarioModal] = useState(false);
  const [name, setName] = useState<string | undefined>();
  const [description, setDescription] = useState<string | undefined>();
  const [, dispatchScenarioUpdate] = useScenario();

  const openCreateScenarioModal = () => {
    setShowCreateScenarioModal(true);
  };

  const clearForm = () => {
    setName(undefined);
    setDescription(undefined);
  };

  const saveNewScenario = async (event: React.FormEvent) => {
    event.preventDefault();

    setShowCreateScenarioModal(false);

    const newScenario = Object.assign({}, SCENARIO_DEFAULTS, {
      name,
      description,
    });

    saveScenario(newScenario)
      .then((scenario) => {
        if (scenario) {
          setName(undefined);
          setDescription(undefined);
          dispatchScenarioUpdate(scenario);
        }
      })
      .then(() => {
        navigate("/facility");
      });
  };

  return (
    <Modal
      modalTitle="Create a new model"
      open={showCreateScenarioModal}
      setOpen={setShowCreateScenarioModal}
      onClose={clearForm}
      trigger={
        <AddScenarioCard onClick={openCreateScenarioModal}>
          <IconAddSquare alt="add model" src={iconAddSquare} />
          <AddScenarioCTA>Create New Model</AddScenarioCTA>
        </AddScenarioCard>
      }
      height="46vh"
      width="25vw"
    >
      <ScenarioForm onSubmit={saveNewScenario}>
        <InputText
          labelAbove="Name:"
          onValueChange={setName}
          labelPlaceholder="Scenario Name"
          required
          type="text"
          valueEntered={name}
          style={{ marginBottom: "16px" }}
        />
        <InputTextArea
          label="Description:"
          onValueChange={setDescription}
          placeholder="Scenario Description"
          required
          value={description}
        />
        <InputButton label="Save" styles={buttonStyles} />
      </ScenarioForm>
    </Modal>
  );
};

export default CreateNewScenarioModal;
