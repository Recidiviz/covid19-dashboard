import { invert } from "lodash";
import React, { useState } from "react";
import styled from "styled-components";

import { referenceFacilitiesProp, saveScenario } from "../database/index";
import Colors from "../design-system/Colors";
import { StyledButton } from "../design-system/InputButton";
import InputSelect from "../design-system/InputSelect";
import ModalDialog from "../design-system/ModalDialog";
import { useFacilities } from "../facilities-context";
import useRejectionToast from "../hooks/useRejectionToast";
import useScenario from "../scenario-context/useScenario";
import { Facilities, Facility } from "./types";

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  font-weight: normal;
`;

const SaveButton = styled(StyledButton)`
  font-size: 14px;
  font-weight: normal;
`;

const CancelButton = styled(StyledButton)`
  background: transparent;
  color: ${Colors.forest};
  font-family: "Libre Franklin";
  font-size: 14px;
  line-height: 26px;
`;

const ModalFooter = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  margin-top: 20px;
`;

const SyncDataTitleContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const TitleText = styled.h1`
  font-weight: 500;
  font-size: 15px;
  line-height: 22px;
  color: ${Colors.forest};
  font-family: "Libre Franklin";
`;

const Row = styled.div`
  border-bottom: 1px solid ${Colors.paleJade20};
  color: ${Colors.forest}
  cursor: pointer;
  display: flex;
  flex-flow: row nowrap;
  font-family: "Libre Franklin", sans serif;
  font-size: 15px;
  line-height: 16px;
  letter-spacing: -0.01em;
  padding: 24px 0;
`;

const Header = styled.h3`
  color: ${Colors.opacityForest};
  font-family: "Poppins", sans serif;
  font-size: 9px;
  font-weight: 600;
`;

// Send in the stateName/systemType to the title
const SyncDataTitle = (
  <SyncDataTitleContainer>
    <TitleText>Prepopulate Data</TitleText>
    <TitleText>
      We've found new facility data - select a corresponding facility to
      autofill with case data
    </TitleText>
    <TitleText>State: Idaho Type of System: State Prison</TitleText>
  </SyncDataTitleContainer>
);

interface Props {
  open: boolean;
  onClose: () => void;
}

const FacilitiesSelect: React.FC<{
  value: Facility["id"] | undefined;
  facilities: Facilities;
  onChange: (value: Facility["id"] | undefined) => void;
}> = ({ value, facilities, onChange }) => {
  return (
    <InputSelect
      onChange={(event) => {
        console.log("onchange event", event.target.value);
        onChange(event.target.value);
      }}
      value={value}
      label={"Your facilities"}
    >
      {facilities.map((facility: Facility) => {
        return (
          <option key={facility.id} value={facility.id}>
            facility.name
          </option>
        );
      })}
    </InputSelect>
  );
};

const ReSyncRefFacilityModal: React.FC<Props> = ({ open, onClose }) => {
  const rejectionToast = useRejectionToast();
  const [mapping, setMapping] = useState<{
    [refFacilityId: string]: Facility["id"];
  }>({});
  const [scenarioState, dispatchScenarioUpdate] = useScenario();
  const scenario = scenarioState.data;
  const {
    state: { facilities: facilitiesState, referenceFacilities },
  } = useFacilities();

  const facilities = Object.values(facilitiesState);

  async function handleSave() {
    if (Object.keys(mapping)) {
      const facilityIdToReferenceId = invert(mapping);

      await rejectionToast(
        saveScenario({
          ...scenario,
          [referenceFacilitiesProp]: Object.assign(
            {},
            scenario?.[referenceFacilitiesProp],
            facilityIdToReferenceId,
          ),
        }).then((savedScenario) => {
          if (savedScenario) dispatchScenarioUpdate(savedScenario);
        }),
      );
    }
    onClose();
  }

  return (
    <ModalDialog open={open} title={SyncDataTitle}>
      <ModalContent>
        <Row>
          <Header>Facilities with available prepopulated data</Header>
          <Header>Your facilities</Header>
        </Row>
        {Object.values(referenceFacilities).map((refFacility) => (
          <>
            <Row>
              {refFacility.canonicalName}
              <FacilitiesSelect
                facilities={facilities}
                value={mapping[refFacility.id]}
                onChange={(facilityId) => {
                  if (facilityId) {
                    setMapping({
                      ...mapping,
                      [refFacility.id]: facilityId,
                    });
                  }
                }}
              />
            </Row>
          </>
        ))}
      </ModalContent>
      <ModalFooter>
        <CancelButton onClick={onClose}>Not now</CancelButton>
        <SaveButton
          disabled={!!Object.keys(mapping).length}
          onClick={handleSave}
        >
          Save
        </SaveButton>
      </ModalFooter>
    </ModalDialog>
  );
};

export default ReSyncRefFacilityModal;
