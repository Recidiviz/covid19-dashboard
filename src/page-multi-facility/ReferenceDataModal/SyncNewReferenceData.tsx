import { isEmpty } from "lodash";
import React, { useState } from "react";
import styled from "styled-components";

import { referenceFacilitiesProp } from "../../database";
import { useFacilities } from "../../facilities-context";
import useScenario from "../../scenario-context/useScenario";
import { Facility, ModelInputs, ReferenceFacility } from "../types";
import ReferenceDataModal from ".";
import {
  getMappedFacilities,
  getMappedReferenceFacilities,
  getUnmappedFacilities,
  getUnmappedReferenceFacilities,
  ReferenceFacilitySelect,
  ReferenceFacilitySelections,
  SubheadingText,
  TitleContainer,
  TitleText,
} from "./shared";

const Spacer = styled.span`
  margin-right: 2em;
`;

const Title: React.FC<Pick<
  Props,
  "stateName" | "systemType" | "useExistingFacilities"
>> = ({ stateName, systemType, useExistingFacilities }) => (
  <TitleContainer>
    <TitleText>Prepopulate Data</TitleText>
    {useExistingFacilities ? (
      <TitleText>
        Select the facilities in your model to autofill with real-time COVID-19
        data. You can turn off or override prepopulated data anytime.
      </TitleText>
    ) : (
      <TitleText>
        We've found new facility data - select a corresponding facility to
        autofill with case data
      </TitleText>
    )}
    <br />
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
  useExistingFacilities?: boolean;
}

const SyncNewReferenceData: React.FC<Props> = ({
  open,
  stateName,
  systemType,
  onClose,
  useExistingFacilities = true,
}) => {
  const [selections, setSelections] = useState<ReferenceFacilitySelections>({});
  const [scenarioState] = useScenario();
  const {
    state: { facilities: facilitiesMapping, referenceFacilities, facilities },
  } = useFacilities();
  const scenario = scenarioState.data;
  const mappedReferenceFacilities = scenario?.[referenceFacilitiesProp] || {};
  const mappedFacilities = getMappedFacilities(
    mappedReferenceFacilities,
    facilitiesMapping,
  );
  const unmappedFacilities = getUnmappedFacilities(
    mappedReferenceFacilities,
    facilitiesMapping,
  );
  const mappedRefFacilities = getMappedReferenceFacilities(
    mappedReferenceFacilities,
    referenceFacilities,
  );
  const unmappedReferenceFacilities = getUnmappedReferenceFacilities(
    mappedReferenceFacilities,
    referenceFacilities,
  );

  if (useExistingFacilities) {
    if (!open || isEmpty(unmappedReferenceFacilities)) return null;
  }

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
      title={
        <Title
          stateName={stateName}
          systemType={systemType}
          useExistingFacilities={useExistingFacilities}
        />
      }
      cancelText="Not now"
    >
      {useExistingFacilities ? (
        <>
          <br />
          <SubheadingText>
            Facilities with available prepopulated data
            <Spacer />
            <Spacer />
            Your facilities
          </SubheadingText>
          <ReferenceFacilitySelect
            facilities={mappedFacilities}
            referenceFacilities={mappedRefFacilities}
            selections={selections}
            onChange={handleChange}
            useExistingFacilities={useExistingFacilities}
          />
        </>
      ) : (
        <ReferenceFacilitySelect
          facilities={unmappedFacilities}
          referenceFacilities={unmappedReferenceFacilities}
          selections={selections}
          onChange={handleChange}
          useExistingFacilities={useExistingFacilities}
        />
      )}
    </ReferenceDataModal>
  );
};

export default SyncNewReferenceData;
