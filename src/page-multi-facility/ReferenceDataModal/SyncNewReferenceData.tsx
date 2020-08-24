import { invert } from "lodash";
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
import SyncReferenceFacilitiesToggle from "./shared/SyncReferenceFacilitiesToggle";

const Spacer = styled.span`
  margin-right: 2em;
`;

interface Props {
  open: boolean;
  stateName: ModelInputs["stateName"];
  systemType: Facility["systemType"];
  onClose: () => void;
  useExistingFacilities?: boolean;
  closeModal?: () => void;
}

const SyncNewReferenceData: React.FC<Props> = ({
  open,
  stateName,
  systemType,
  onClose,
  useExistingFacilities = false,
  closeModal,
}) => {
  const [selections, setSelections] = useState<ReferenceFacilitySelections>({});
  const [scenarioState] = useScenario();
  const {
    state: { facilities: facilitiesMapping, referenceFacilities },
  } = useFacilities();
  const scenario = scenarioState.data;
  const [useReferenceData, setUseReferenceData] = useState(
    scenario?.useReferenceData,
  );

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

  const toggleUseReferenceData = (useReferenceDataToggle: boolean) => {
    setUseReferenceData(useReferenceDataToggle);
  };

  const disableSelections = !useReferenceData;

  return (
    <ReferenceDataModal
      open={open}
      onClose={onClose}
      selections={selections}
      title="Prepopulate Data"
      cancelText="Not now"
      saveType="replace"
      closeModal={closeModal}
      useReferenceDataToggleValue={useReferenceData}
    >
      <>
        <TitleContainer>
          {useExistingFacilities ? (
            <TitleText>
              Select the facilities in your model to autofill with real-time
              COVID-19 data. You can turn off or override prepopulated data
              anytime.
            </TitleText>
          ) : (
            <TitleText>
              We've found new facility data - select a corresponding facility to
              autofill with case data
            </TitleText>
          )}
          <SyncReferenceFacilitiesToggle
            stateName={stateName}
            systemType={systemType}
            useReferenceData={useReferenceData}
            callback={toggleUseReferenceData}
          />
        </TitleContainer>
        <ReferenceFacilitySelect
          facilities={
            useExistingFacilities
              ? Object.values(facilitiesMapping)
              : unmappedFacilities
          }
          referenceFacilities={
            useExistingFacilities
              ? Object.values(referenceFacilities)
              : unmappedReferenceFacilities
          }
          selections={selections}
          onChange={handleChange}
          useExistingFacilities={useExistingFacilities}
          disabled={disableSelections}
        />
      </>
    </ReferenceDataModal>
  );
};

export default SyncNewReferenceData;
