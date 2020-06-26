import { isEmpty } from "lodash";
import React, { useState } from "react";
import styled from "styled-components";

import { referenceFacilitiesProp } from "../../database";
import { useFacilities } from "../../facilities-context";
import useScenario from "../../scenario-context/useScenario";
import { Facility, ModelInputs, ReferenceFacility } from "../types";
import ReferenceDataModal from ".";
import {
  getUnmappedFacilities,
  getUnmappedReferenceFacilities,
  ReferenceFacilitySelect,
  ReferenceFacilitySelections,
  TitleContainer,
  TitleText,
} from "./shared";

const Spacer = styled.span`
  margin-right: 2em;
`;

const Title: React.FC<Pick<Props, "stateName" | "systemType">> = ({
  stateName,
  systemType,
}) => (
  <TitleContainer>
    <TitleText>Prepopulate Data</TitleText>
    <TitleText>
      We've found new facility data - select a corresponding facility to
      autofill with case data
    </TitleText>
    <TitleText>
      State: {stateName}
      <Spacer />
      Type of System: {systemType}
    </TitleText>
  </TitleContainer>
);

interface Props {
  open: boolean;
  stateName: ModelInputs["stateName"];
  systemType: Facility["systemType"];
  onClose: () => void;
}

const SyncNewReferenceData: React.FC<Props> = ({
  open,
  stateName,
  systemType,
  onClose,
}) => {
  const [selections, setSelections] = useState<ReferenceFacilitySelections>({});
  const [scenarioState] = useScenario();
  const {
    state: { facilities: facilitiesMapping, referenceFacilities },
  } = useFacilities();
  const scenario = scenarioState.data;
  const mappedReferenceFacilities = scenario?.[referenceFacilitiesProp] || {};
  const unmappedFacilities = getUnmappedFacilities(
    mappedReferenceFacilities,
    facilitiesMapping,
  );
  const unmappedReferenceFacilities = getUnmappedReferenceFacilities(
    mappedReferenceFacilities,
    referenceFacilities,
  );

  if (!open || isEmpty(unmappedReferenceFacilities)) return null;

  function handleChange(refFacilityId: ReferenceFacility["id"]) {
    return (facilityId: Facility["id"] | undefined) => {
      if (facilityId) {
        setSelections({
          ...selections,
          [refFacilityId]: facilityId,
        });
      } else {
        const selectionsCopy = { ...selections };
        delete selectionsCopy[refFacilityId];
        setSelections(selectionsCopy);
      }
    };
  }

  return (
    <ReferenceDataModal
      open={open}
      onClose={onClose}
      selections={selections}
      title={<Title stateName={stateName} systemType={systemType} />}
      cancelText="Not now"
    >
      <ReferenceFacilitySelect
        facilities={unmappedFacilities}
        referenceFacilities={unmappedReferenceFacilities}
        selections={selections}
        onChange={handleChange}
      />
    </ReferenceDataModal>
  );
};

export default SyncNewReferenceData;
