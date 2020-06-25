import React from "react";
import styled from "styled-components";

import Colors from "../../../design-system/Colors";
import InputSelect from "../../../design-system/InputSelect";
import { ReferenceFacilityMapping } from "../../../facilities-context";
import { Facilities, Facility, ReferenceFacility } from "../../types";
import { ReferenceFacilitySelections } from ".";

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
  flex: 1 1;
`;

interface FacilitiesSelectProps {
  value: Facility["id"] | undefined;
  selections: ReferenceFacilitySelections;
  facilities: Facilities;
  onChange: (facilityId: Facility["id"] | undefined) => void;
}

const FacilitiesSelect: React.FC<FacilitiesSelectProps> = ({
  selections,
  value,
  facilities,
  onChange,
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

interface ReferenceFacilitySelect {
  referenceFacilities: ReferenceFacilityMapping;
  facilities: Facilities;
  onChange: (
    id: ReferenceFacility["id"],
  ) => (facilityId: Facility["id"] | undefined) => void;
  selections: ReferenceFacilitySelections;
}

export const ReferenceFacilitySelect: React.FC<ReferenceFacilitySelect> = ({
  referenceFacilities,
  facilities,
  selections,
  onChange,
}) => {
  return (
    <>
      {Object.values(referenceFacilities).map((refFacility) => {
        return (
          <Row key={refFacility.id}>
            <FacilityName>{refFacility.canonicalName}</FacilityName>
            <FacilitiesSelect
              selections={selections}
              facilities={facilities}
              value={selections[refFacility.id]}
              onChange={onChange(refFacility.id)}
            />
          </Row>
        );
      })}
    </>
  );
};
