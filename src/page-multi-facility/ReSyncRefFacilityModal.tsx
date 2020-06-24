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
import {
  Facilities,
  Facility,
  FacilityReferenceMapping,
  ModelInputs,
  ReferenceFacility,
} from "./types";

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

  &:nth-of-type(3) {
    margin: 10px 0;
  }
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
  flex: 1 1;
  font-family: "Poppins", sans serif;
  font-size: 9px;
  font-weight: 600;
`;

const HeaderRow = styled(Row)`
  padding: 10px 0;
  border-bottom: 0;
`;

const FacilityName = styled.div`
  flex: 1 1;
`;

const FacilitySelectContainer = styled.div`
  max-width: 300px;
  flex: 1 1;
`;

const Spacer = styled.span`
  margin-right: 2em;
`;

const SyncDataTitle: React.FC<{
  stateName: ModalProps["stateName"];
  systemType: ModalProps["systemType"];
}> = ({ stateName, systemType }) => (
  <SyncDataTitleContainer>
    <TitleText>Prepopulate Data</TitleText>
    <TitleText>
      We've found new facility data - select a corresponding facility to
      autofill with case data
    </TitleText>
    {stateName && systemType && (
      <TitleText>
        State: {stateName}
        <Spacer />
        Type of System: {systemType}
      </TitleText>
    )}
  </SyncDataTitleContainer>
);

const FacilitiesSelect: React.FC<{
  value: Facility["id"] | undefined;
  selections: { [key in ReferenceFacility["id"]]: Facility["id"] };
  facilities: Facilities;
  onChange: (value: Facility["id"] | undefined) => void;
}> = ({ selections, value, facilities, onChange }) => {
  const disabledOption = (facilityId: Facility["id"]) =>
    Object.values(selections).includes(facilityId);
  return (
    <FacilitySelectContainer>
      <InputSelect
        onChange={(event) => {
          console.log("onchange event", event.target.value);
          const value = event.target.value;
          onChange(value === "" ? undefined : value);
        }}
        value={value || ""}
      >
        <option value={""}>Select a facility</option>
        {facilities.map((facility: Facility) => {
          return (
            <option
              key={facility.id}
              value={facility.id}
              disabled={disabledOption(facility.id)}
            >
              {facility.name}
            </option>
          );
        })}
      </InputSelect>
    </FacilitySelectContainer>
  );
};

const filterSyncedFacilities = (
  syncedRefFacilities: FacilityReferenceMapping,
) => {
  return (facility: Facility) => {
    return !Object.keys(syncedRefFacilities).includes(facility.id);
  };
};

interface ModalProps {
  open: boolean;
  stateName: ModelInputs["stateName"];
  systemType: Facility["systemType"];
  onClose: () => void;
}

const ReSyncRefFacilityModal: React.FC<ModalProps> = ({
  open,
  stateName,
  systemType,
  onClose,
}) => {
  const rejectionToast = useRejectionToast();
  const [scenarioState, dispatchScenarioUpdate] = useScenario();
  const {
    state: { facilities: facilitiesState, referenceFacilities },
  } = useFacilities();

  const [selections, setSelections] = useState<{
    [refFacilityId: string]: Facility["id"];
  }>({});

  const scenario = scenarioState.data;
  const syncedRefFacilities = scenario?.[referenceFacilitiesProp] || {};

  if (!open) return null;

  const facilities = Object.values(facilitiesState).filter(
    filterSyncedFacilities(syncedRefFacilities),
  );

  async function handleSave() {
    if (Object.keys(selections)) {
      const facilityIdToReferenceId = invert(selections);

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
    <ModalDialog
      open={open}
      title={<SyncDataTitle stateName={stateName} systemType={systemType} />}
    >
      <ModalContent>
        <HeaderRow>
          <Header>Facilities with available prepopulated data</Header>
          <Header>Your facilities</Header>
        </HeaderRow>
        {Object.values(referenceFacilities).map((refFacility) => {
          return (
            <Row key={refFacility.id}>
              <FacilityName>{refFacility.canonicalName}</FacilityName>
              <FacilitiesSelect
                selections={selections}
                facilities={facilities}
                value={selections[refFacility.id]}
                onChange={(facilityId) => {
                  if (facilityId) {
                    setSelections({
                      ...selections,
                      [refFacility.id]: facilityId,
                    });
                  } else {
                    const selectionsCopy = { ...selections };
                    delete selectionsCopy[refFacility.id];
                    setSelections(selectionsCopy);
                  }
                }}
              />
            </Row>
          );
        })}
      </ModalContent>
      <ModalFooter>
        <CancelButton onClick={onClose}>Not now</CancelButton>
        <SaveButton
          disabled={!Object.keys(selections).length}
          onClick={handleSave}
        >
          Save
        </SaveButton>
      </ModalFooter>
    </ModalDialog>
  );
};

export default ReSyncRefFacilityModal;
