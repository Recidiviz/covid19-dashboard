import { invert, isEmpty } from "lodash";
import React, { useEffect, useState } from "react";
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
  useExistingFacilities = false,
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

  useEffect(() => {
    // set current mapping as initial selections when scenario changes
    if (scenario) {
      setSelections(invert(scenario[referenceFacilitiesProp]));
    }
  }, [scenario]);

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
          <ReferenceFacilitySelect
            facilities={Object.values(facilitiesMapping)}
            referenceFacilities={Object.values(referenceFacilities)}
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
