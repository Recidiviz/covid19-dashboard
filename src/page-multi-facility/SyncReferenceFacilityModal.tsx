import { navigate } from "gatsby";
import React, { useState } from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import dataSyncSelectedIcon from "../design-system/icons/ic_data_sync_selected.svg";
import dataSyncIcon from "../design-system/icons/ic_data_sync.svg";
import { StyledButton } from "../design-system/InputButton";
import ModalDialog from "../design-system/ModalDialog";
import { getFacilityById, useFacilities } from "../facilities-context";
import { ReferenceFacility } from "./types";

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

const Row = styled.div<{ selected: boolean }>`
  border-bottom: 1px solid ${Colors.paleJade20};
  color: ${(props) => (props.selected ? Colors.forest : Colors.paleJade)};
  cursor: pointer;
  display: flex;
  flex-flow: row nowrap;
  font-family: "Libre Franklin", sans serif;
  font-size: 15px;
  line-height: 16px;
  letter-spacing: -0.01em;
  padding: 24px 0;
`;

const RowIcon = styled.img`
  margin-right: 12px;
`;

const SyncDataTitle = (
  <SyncDataTitleContainer>
    <TitleText>Sync Data</TitleText>
    <TitleText>
      To sync with daily public facility data, please select the corresponding
      facility.
    </TitleText>
  </SyncDataTitleContainer>
);

interface Props {
  facilityId: string | null;
}

interface ReferenceFacilityProps {
  referenceFacility: ReferenceFacility;
  onClick: () => void;
  selected: boolean;
}

const ReferenceFacilityRow: React.FC<ReferenceFacilityProps> = ({
  referenceFacility,
  onClick,
  selected,
}) => {
  return (
    <Row selected={selected} onClick={onClick}>
      <RowIcon
        src={selected ? dataSyncSelectedIcon : dataSyncIcon}
        alt="data sync icon"
      />
      {referenceFacility.canonicalName}
    </Row>
  );
};

const SyncReferenceFacilityModal: React.FC<Props> = ({ facilityId }) => {
  const {
    state: { facilities, referenceFacilities },
    actions: { deselectFacility },
  } = useFacilities();
  const [selectedRefFacility, setSelectedRefFacility] = useState<string | null>(
    null,
  );
  const facility = getFacilityById(facilities, facilityId);

  function handleClick(refFacility: ReferenceFacility) {
    if (selectedRefFacility !== refFacility.id) {
      setSelectedRefFacility(refFacility.id);
    } else {
      setSelectedRefFacility(null);
    }
  }

  function handleSave() {
    if (selectedRefFacility) {
      deselectFacility();
      // save a synced composite facility?
      console.log({ facility, selectedRefFacility });
      navigate("/");
    }
  }

  return (
    <ModalDialog open={!!facilityId} title={SyncDataTitle}>
      <ModalContent>
        {Object.values(referenceFacilities).map((refFacility) => (
          <ReferenceFacilityRow
            key={refFacility.id}
            selected={selectedRefFacility === refFacility.id}
            referenceFacility={refFacility}
            onClick={() => handleClick(refFacility)}
          />
        ))}
      </ModalContent>
      <ModalFooter>
        <CancelButton
          onClick={() => {
            deselectFacility();
            navigate("/");
          }}
        >
          Don't sync this facility
        </CancelButton>
        <SaveButton disabled={!selectedRefFacility} onClick={handleSave}>
          Save
        </SaveButton>
      </ModalFooter>
    </ModalDialog>
  );
};

export default SyncReferenceFacilityModal;
