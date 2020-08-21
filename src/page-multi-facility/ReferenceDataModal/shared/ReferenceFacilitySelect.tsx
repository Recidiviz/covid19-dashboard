import React from "react";
import styled from "styled-components";

import Colors from "../../../design-system/Colors";
import InputSelect from "../../../design-system/InputSelect";
import { Facilities, Facility, ReferenceFacility } from "../../types";
import {
  ReferenceFacilitySelections,
  SubheadingContainer,
  SubheadingText,
} from ".";

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

const FacilitySelectContainer = styled.div`
  max-width: 300px;
  flex: 1 1;
`;

const FacilityName = styled.div`
  margin-top: 10px;
  flex: 1 1;
`;

interface FacilitiesSelectProps {
  value: Facility["id"] | undefined;
  selections: ReferenceFacilitySelections;
  facilities: Facilities;
  onChange: (facilityId: Facility["id"] | undefined) => void;
  useExistingFacilities?: boolean;
}

const FacilitiesSelect: React.FC<FacilitiesSelectProps> = ({
  selections,
  value,
  facilities,
  onChange,
  useExistingFacilities = false,
}) => {
  const disabledOption = (facilityId: Facility["id"]) =>
    Object.values(selections).includes(facilityId);

  return (
    <FacilitySelectContainer>
      <InputSelect
        onChange={(event) => {
          const value = event.target.value;
          onChange(value === "" ? undefined : value);
        }}
        value={value || ""}
      >
        {/* TODO per #556: what value to use here? */}
        {useExistingFacilities && (
          <option value={"skip"}>Don't autofill this facility</option>
        )}
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

interface ReferenceFacilitySelectProps {
  referenceFacilities: ReferenceFacility[];
  facilities: Facilities;
  onChange: (
    id: ReferenceFacility["id"],
  ) => (facilityId: Facility["id"] | undefined) => void;
  selections: ReferenceFacilitySelections;
  useExistingFacilities?: boolean;
}

export const ReferenceFacilitySelect: React.FC<ReferenceFacilitySelectProps> = ({
  referenceFacilities,
  facilities,
  selections,
  onChange,
  useExistingFacilities = false,
}) => {
  return (
    <>
      {" "}
      {useExistingFacilities && (
        <SubheadingContainer>
          <SubheadingText>
            Facilities with available prepopulated data
          </SubheadingText>
          <SubheadingText>Your facilities</SubheadingText>
        </SubheadingContainer>
      )}
      {referenceFacilities.map((refFacility) => {
        return (
          <>
            <Row key={refFacility.id}>
              <FacilityName>{refFacility.canonicalName}</FacilityName>
              <FacilitiesSelect
                selections={selections}
                facilities={facilities}
                value={selections[refFacility.id]}
                onChange={onChange(refFacility.id)}
                useExistingFacilities={useExistingFacilities}
              />
            </Row>
          </>
        );
      })}
    </>
  );
};
