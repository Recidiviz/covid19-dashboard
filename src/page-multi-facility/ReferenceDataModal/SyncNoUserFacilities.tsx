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
import {
  FacilityReferenceMapping,
  ReferenceFacility,
  Scenario,
} from "../types";
import ReferenceFacilityRow from "./shared/ReferenceFacilityRow";

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
};

type StateNameSelectionProps = StateNameProps & {
  stateNames: string[];
};

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
  } = props;

  // This card doesn't have a title so we just clear out any existing
  // title that may exist if the user navigates back to this card.
  useEffect(() => {
    setModalTitle("");
  }, [setModalTitle]);

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
    scenario,
    dispatchScenarioUpdate,
  } = props;

  const {
    actions: { createOrUpdateFacility, fetchReferenceFacilities },
  } = useFacilities();
  const [referenceFacilities, setReferenceFacilities] = useState<
    ReferenceFacility[]
  >([]);
  const [selectedFacilities, setSelectedFacilities] = useState<
    ReferenceFacility[]
  >([]);

  useEffect(() => {
    setModalTitle("Prepopulate Data");

    const retrieveReferenceFacilities = async () => {
      if (!stateName || !systemType) return;

      const referenceFacilityMapping = await fetchReferenceFacilities(
        stateName,
        systemType,
      );
      const facilities = Object.values(referenceFacilityMapping);

      setReferenceFacilities(facilities);
      // By default, select all of the available Reference Facilities
      setSelectedFacilities(facilities);
    };
    retrieveReferenceFacilities();
    // only run when the state name or system type change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateName, systemType]);

  const handleSelection = (refFacility: ReferenceFacility) => {
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

  const handleSave = async () => {
    const facilitySaves = selectedFacilities.map((facility) => {
      const minimalModelInput = {
        observedAt: new Date(),
        updatedAt: new Date(),
        stateName: facility.stateName,
        countyName: facility.countyName,
      };

      return createOrUpdateFacility({
        name: facility.canonicalName,
        systemType: facility.facilityType,
        modelInputs: minimalModelInput,
        modelVersions: [minimalModelInput],
      });
    });

    const savedFacilities = await Promise.all(facilitySaves);

    // If for whatever reason the number of facilities saved does not match the
    // number of facilities that were originally selected then return immediately
    // so that we don't mis-match User Facilities with Reference Facilities.  See
    // the comment below about how we use insertion order and indexing to map User
    // Facilities to Reference Facilities.
    if (savedFacilities.length !== selectedFacilities.length) {
      console.error(`The number of saved facilities (${savedFacilities.length}) does not match \
        the number of selected facilities (${selectedFacilities.length}). The saved User \
        Facilities will not be mapped to selected Reference Facilities.`);
      return;
    }

    // Promise.all preserves insertion order so we can use this information to guarnatee User
    // Facilities in the savedFacilities array have a matching index with the Reference
    // Facilities in the selectedFacilities array.  Since the indexes match, it is acceptable
    // to generate the facilityIdToReferenceId mapping by iterating over the savedFacilities
    // and mapping corresponding entries at the same index in the selectedFacilities array.
    // See the following StackOverflow entry for an example of Promise.all's return ordering:
    // https://stackoverflow.com/questions/28066429/promise-all-order-of-resolved-values
    const facilityIdToReferenceId: FacilityReferenceMapping = {};

    savedFacilities.map((facility, index) => {
      if (!facility) return;
      facilityIdToReferenceId[facility.id] = selectedFacilities[index].id;
    });

    saveScenario({
      ...scenario,
      [referenceFacilitiesProp]: Object.assign(
        {},
        scenario?.[referenceFacilitiesProp],
        facilityIdToReferenceId,
      ),
    }).then((savedScenario) => {
      if (savedScenario) dispatchScenarioUpdate(savedScenario);
    });
  };

  return (
    <CardContent>
      <CardDescription>
        We found publicly available data for these facilities. Click "Save" to
        import and autofill them with real-time COVID-19 data. You can add
        facilities or override prepopulated data anytime.
      </CardDescription>
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
  );
};

const SyncNoUserFacilities: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(true);
  const [activeStep, setActiveStep] = useState(STATE_AND_SYSTEM_SELECTION_CARD);
  const [modalTitle, setModalTitle] = useState<string>();
  const [systemType, setSystemType] = useState<string>();
  const [stateName, setStateName] = useState<string>();
  const [scenarioState, dispatchScenarioUpdate] = useScenario();
  const scenario = scenarioState.data;

  // Immediately set the referenceDataObservedAt time so that
  // this modal does not compete with the SyncNewReferenceData
  // modal for attention.
  useEffect(() => {
    saveScenario({
      ...scenario,
      referenceDataObservedAt: new Date(),
    }).then((savedScenario) => {
      if (savedScenario) dispatchScenarioUpdate(savedScenario);
    });
    // only want to run this once, on initial mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Modal
      modalTitle={modalTitle}
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
        />
      )}
      {activeStep === SYNC_REFERENCE_FACILITIES_CARD && scenario && (
        <SyncReferenceFacilitiesCard
          stateName={stateName}
          systemType={systemType}
          setActiveStep={setActiveStep}
          setModalTitle={setModalTitle}
          scenario={scenario}
          dispatchScenarioUpdate={dispatchScenarioUpdate}
        />
      )}
    </Modal>
  );
};

export default SyncNoUserFacilities;
