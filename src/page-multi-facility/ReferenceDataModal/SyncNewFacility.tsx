import { findKey } from "lodash";
import React, { useState } from "react";

import ReferenceDataModal from ".";
import {
  ReferenceFacilityList,
  ReferenceFacilitySelections,
  TitleContainer,
  TitleText,
} from "./shared";

const Title = (
  <TitleContainer>
    <TitleText>Prepopulate Data</TitleText>
    <TitleText>
      To autofill this facility with real-time COVID-19 data, please select the
      corresponding facility.
    </TitleText>
  </TitleContainer>
);

interface Props {
  facilityId: string | null;
  onClose: () => void;
}

const SyncNewFacility: React.FC<Props> = ({ facilityId, onClose }) => {
  const [selections, setSelections] = useState<ReferenceFacilitySelections>({});

  if (!facilityId) return null;

  return (
    <ReferenceDataModal
      open={!!facilityId}
      onClose={onClose}
      selections={selections}
      title={Title}
      cancelText="Don't prepopulate this facility"
    >
      <ReferenceFacilityList
        onClick={(refFacilityId) => {
          if (!selections[refFacilityId]) {
            setSelections({ [refFacilityId]: facilityId });
          } else {
            setSelections({});
          }
        }}
        selectedId={findKey(
          selections,
          (selection) => selection === facilityId,
        )}
      />
    </ReferenceDataModal>
  );
};

export default SyncNewFacility;