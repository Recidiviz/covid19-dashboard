import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { referenceFacilitiesProp, saveScenario } from "../../database";
import Colors from "../../design-system/Colors";
import InputButton from "../../design-system/InputButton";
import InputSelect from "../../design-system/InputSelect";
import Modal from "../../design-system/Modal";
import { useFacilities } from "../../facilities-context";
import { useLocaleDataState } from "../../locale-data-context";
import useScenario from "../../scenario-context/useScenario";
import SystemTypeSelection from "../SystemTypeSelection";
import { ReferenceFacility, Scenario } from "../types";
import ReferenceFacilityRow from "./shared/ReferenceFacilityRow";
import SyncReferenceFacilitiesToggle from "./shared/SyncReferenceFacilitiesToggle";

const STATE_AND_SYSTEM_SELECTION_CARD = "STATE_AND_SYSTEM_SELECTION_CARD";
const SYNC_REFERENCE_FACILITIES_CARD = "SYNC_REFERENCE_FACILITIES_CARD";

const CardContent = styled.div`
  color: ${Colors.green};
  font-style: normal;
  font-weight: normal;
  letter-spacing: -0.02em;
  line-height: 150%;
`;

const CardDescription = styled.div`
  margin: 20px 0px;
`;

const CardNavigation = styled.div`
  border-top: 0.5px solid ${Colors.darkGray};
  display: flex;
  justify-content: space-between;
  flex-direction: row-reverse;
  padding-top: 20px;
  width: 100%;
`;

const StateAndSystemForm = styled.div`
  display: flex;
  margin-bottom: 20px;
`;

const ModalDescription = styled.div`
  font-weight: 500;
  font-size: 15px;
  line-height: 22px;
  color: ${Colors.forest};
  font-family: "Libre Franklin";
  margin-bottom: 20px;
`;

type StateNameProps = {
  stateName?: string;
  setStateName: (stateName?: string) => void;
};

type SystemTypeProps = {
  systemType?: string;
  setSystemType: (systemType?: string) => void;
};

type CardStateProps = {
  setActiveStep: (activeStep: string) => void;
  setModalTitle: (modalTitle: string) => void;
  setModalDescription: (modalDescription: string | React.ReactElement) => void;
};

type StateNameSelectionProps = StateNameProps & {
  stateNames: string[];
};

const SyncNoUserFacilitiesModalDescription: React.FC = () => (
  <ModalDescription>
    We found publicly available data for these facilities. Click "Save" to
    import and autofill them with real-time COVID-19 data. You can add
    facilities or override prepopulated data anytime.
  </ModalDescription>
);

const StateNameSelection: React.FC<StateNameSelectionProps> = (props) => {
  const { stateName, stateNames, setStateName } = props;

  return (
    <InputSelect
      label="State"
      value={stateName}
      onChange={(event) => {
        setStateName(event.target.value);
      }}
    >
      <option value="" />
      {stateNames.map((name) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </InputSelect>
  );
};

type StateAndSystemProps = StateNameProps & SystemTypeProps & CardStateProps;

const StateAndSystemSelectionCard: React.FC<StateAndSystemProps> = (props) => {
  const {
    stateName,
    setStateName,
    systemType,
    setSystemType,
    setActiveStep,
    setModalTitle,
    setModalDescription,
  } = props;

  // This card doesn't have a title or description so we just clear out any existing
  // title  or description that may exist if the user navigates back to this card.
  useEffect(() => {
    setModalTitle("");
    setModalDescription("");
  }, [setModalTitle, setModalDescription]);

  const { data: localeDataSource } = useLocaleDataState();

  const stateNames = Array.from(localeDataSource.keys()).filter(
    (name) => name !== "US Total" && name !== "US Federal Prisons",
  );

  const handleNextButtonClick = async () => {
    setActiveStep(SYNC_REFERENCE_FACILITIES_CARD);
  };

  return (
    <CardContent>
      <CardDescription>
        Recidiviz provides a forecast of likely COVID-19 cases in your
        facilities based on policies and populations.
      </CardDescription>
      <StateAndSystemForm>
        <StateNameSelection
          stateName={stateName}
          stateNames={stateNames}
          setStateName={setStateName}
        />
        <SystemTypeSelection
          systemType={systemType}
          setSystemType={setSystemType}
        />
      </StateAndSystemForm>
      <CardNavigation>
        <InputButton
          styles={{
            width: "80px",
          }}
          label="Next"
          onClick={handleNextButtonClick}
        />
      </CardNavigation>
    </CardContent>
  );
};

type SyncReferenceFacilitiesCardProps = CardStateProps & {
  stateName: StateNameProps["stateName"];
  systemType: SystemTypeProps["systemType"];
  scenario: Scenario;
  dispatchScenarioUpdate: (scenario: Scenario) => void;
};

const SyncReferenceFacilitiesCard: React.FC<SyncReferenceFacilitiesCardProps> = (
  props,
) => {
  const {
    stateName,
    systemType,
    setActiveStep,
    setModalTitle,
    setModalDescription,
    scenario,
    dispatchScenarioUpdate,
  } = props;

  const {
    actions: {
      fetchReferenceFacilities,
      receiveReferenceFacilities,
      createUserFacilitiesFromReferences,
    },
  } = useFacilities();
  const [referenceFacilities, setReferenceFacilities] = useState<
    ReferenceFacility[]
  >([]);
  const [selectedFacilities, setSelectedFacilities] = useState<
    ReferenceFacility[]
  >([]);
  const [useReferenceData, setUseReferenceData] = useState(
    scenario?.useReferenceData,
  );

  useEffect(() => {
    setModalTitle("Prepopulate Data");
    setModalDescription(<SyncNoUserFacilitiesModalDescription />);

    const retrieveReferenceFacilities = async () => {
      if (!stateName || !systemType) return;

      const referenceFacilitiesMapping = await fetchReferenceFacilities(
        stateName,
        systemType,
      );
      receiveReferenceFacilities(referenceFacilitiesMapping);
      const facilities = Object.values(referenceFacilitiesMapping);
      setReferenceFacilities(facilities);
      // By default, select all of the available Reference Facilities
      setSelectedFacilities(facilities);
    };
    retrieveReferenceFacilities();
    // only run when the state name or system type change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateName, systemType]);

  const handleSelection = (refFacility: ReferenceFacility) => {
    // Don't allow user selections if the toggle to use
    // reference data has been turned off.
    if (useReferenceData !== undefined && !useReferenceData) return;

    const selectedFacilitiesCopy = [...selectedFacilities];

    if (selectedFacilitiesCopy.includes(refFacility)) {
      let index = selectedFacilitiesCopy.indexOf(refFacility);
      selectedFacilitiesCopy.splice(index, 1);
    } else {
      selectedFacilitiesCopy.push(refFacility);
    }

    setSelectedFacilities(selectedFacilitiesCopy);
  };

  const handleBackButtonClick = () => {
    setActiveStep(STATE_AND_SYSTEM_SELECTION_CARD);
  };

  const toggleUseReferenceData = (useReferenceDataToggle: boolean) => {
    setUseReferenceData(useReferenceDataToggle);
    setSelectedFacilities(useReferenceDataToggle ? referenceFacilities : []);
  };

  const handleSave = async () => {
    const facilityToReference = await createUserFacilitiesFromReferences(
      selectedFacilities,
      scenario,
    );

    if (facilityToReference) {
      const updatedScenario = await saveScenario({
        ...scenario,
        useReferenceData,
        [referenceFacilitiesProp]: Object.assign(
          {},
          scenario?.[referenceFacilitiesProp],
          facilityToReference,
        ),
      });

      if (updatedScenario) dispatchScenarioUpdate(updatedScenario);
    }
  };

  return (
    <>
      <SyncReferenceFacilitiesToggle
        stateName={stateName}
        systemType={systemType}
        useReferenceData={useReferenceData}
        callback={toggleUseReferenceData}
      />
      <CardContent>
        {referenceFacilities.map((refFacility) => (
          <ReferenceFacilityRow
            key={refFacility.id}
            selected={selectedFacilities.includes(refFacility)}
            referenceFacility={refFacility}
            onClick={() => handleSelection(refFacility)}
          />
        ))}
        <CardNavigation>
          <InputButton
            styles={{
              width: "80px",
            }}
            label="Save"
            onClick={handleSave}
          />
          <InputButton
            styles={{
              background: "transparent",
              fontWeight: "normal",
              color: Colors.forest,
              width: "50px",
            }}
            label="Back"
            onClick={handleBackButtonClick}
          />
        </CardNavigation>
      </CardContent>
    </>
  );
};

const SyncNoUserFacilities: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(true);
  const [activeStep, setActiveStep] = useState(STATE_AND_SYSTEM_SELECTION_CARD);
  const [modalTitle, setModalTitle] = useState<string>();
  const [modalDescription, setModalDescription] = useState<
    string | React.ReactElement
  >();
  const [systemType, setSystemType] = useState<string>();
  const [stateName, setStateName] = useState<string>();
  const [scenarioState, dispatchScenarioUpdate] = useScenario();
  const scenario = scenarioState.data;

  return (
    <Modal
      modalTitle={modalTitle}
      modalDescription={modalDescription}
      open={modalOpen}
      setOpen={setModalOpen}
      width="600px"
    >
      {activeStep === STATE_AND_SYSTEM_SELECTION_CARD && (
        <StateAndSystemSelectionCard
          stateName={stateName}
          setStateName={setStateName}
          systemType={systemType}
          setSystemType={setSystemType}
          setActiveStep={setActiveStep}
          setModalTitle={setModalTitle}
          setModalDescription={setModalDescription}
        />
      )}
      {activeStep === SYNC_REFERENCE_FACILITIES_CARD && scenario && (
        <SyncReferenceFacilitiesCard
          stateName={stateName}
          systemType={systemType}
          setActiveStep={setActiveStep}
          setModalTitle={setModalTitle}
          setModalDescription={setModalDescription}
          scenario={scenario}
          dispatchScenarioUpdate={dispatchScenarioUpdate}
        />
      )}
    </Modal>
  );
};

export default SyncNoUserFacilities;
