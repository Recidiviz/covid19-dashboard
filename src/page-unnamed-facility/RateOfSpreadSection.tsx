import React, { useState } from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import InputCheckbox from "../design-system/InputCheckbox";
import InputDate from "../design-system/InputDate";
import InputLabelAndHelp from "../design-system/InputLabelAndHelp";
import InputTextNumeric from "../design-system/InputTextNumeric";
import {
  FormGridCell,
  FormGridColumn,
  FormGridRow,
} from "../impact-dashboard/FormGrid";

const borderStyle = `1px solid ${Colors.paleGreen}`;

const RateOfSpreadDiv = styled.div`
  border-top: ${borderStyle};
`;
const SectionHeader = styled.header`
  font-family: Poppins;
  font-weight: 400;
  font-size: 16px;
  line-height: 16px;
  padding: 20px 0;
  color: "${Colors.forest}"
`;

export const PolicyCheckboxContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: 16px;
`;

let defaultPolicies = {
  staff: {
    recentContact: {
      value: false,
      label:
        "All staff are screened for recent contact with COVID-19 positive individuals on arrival to work",
    },
    feverScreen: {
      value: false,
      label: "All staff are screened for fever on arrival to work",
    },
    restrictedMovement: {
      value: false,
      label:
        "Staff movement between facilities has been significantly restricted",
    },
  },
  incarcerated: {
    visitation: {
      value: false,
      label: "In-person visitation has been suspended",
    },
    restrictedRecreactionTime: {
      value: false,
      label:
        "Recreation time has been restricted to the same groups of individuals daily, and in small numbers (<12)",
    },
    sanitizedRecreationEquipment: {
      value: false,
      label: "Recreation equipment is sanitized between each group's use",
    },
    quarantine: {
      value: false,
      label:
        "Individuals with COVID-19 symptoms are quarantined within 24hrs of symptoms",
    },
  },
};
const RateOfSpreadSection: React.FC = () => {
  const [policies, setPolicies] = useState(defaultPolicies);

  const updatePolicy = (type, id) => {
    policies[type][id].value = !policies[type][id].value;
    setPolicies({ ...policies });
  };

  return (
    <RateOfSpreadDiv>
      <SectionHeader>Rate of Spread</SectionHeader>
      <FormGridRow>
        <FormGridCell width={25}>
          <InputLabelAndHelp label="Upcoming Releases" />
        </FormGridCell>
        <FormGridCell width={30}>
          <InputDate
            labelAbove={"Release date"}
            labelHelp={`Enter the date of any planned reductions in the in-facility
                   population below (e.g., early releases to supervision).`}
            valueEntered=""
            onValueChange=""
          />
        </FormGridCell>
        <FormGridCell width={30}>
          <InputTextNumeric
            labelAbove={"Number released"}
            labelHelp={
              "Enter the number of incarcerated people you plan to release."
            }
            type="number"
            valueEntered=""
            onValueChange=""
          />
        </FormGridCell>
      </FormGridRow>
      <FormGridRow>
        <FormGridCell>
          <InputLabelAndHelp label="Policies" />
        </FormGridCell>
      </FormGridRow>
      <PolicyCheckboxContainer>
        <FormGridColumn>
          {Object.entries(policies.staff).map(([id, policy]) => {
            return (
              <FormGridCell key={id}>
                <InputCheckbox
                  key={id}
                  checked={policy.value}
                  onChange={() => updatePolicy("staff", id)}
                  label={policy.label}
                />
              </FormGridCell>
            );
          })}
        </FormGridColumn>
        <FormGridColumn>
          {Object.entries(policies.incarcerated).map(([id, policy]) => {
            return (
              <FormGridCell key={id}>
                <InputCheckbox
                  key={id}
                  checked={policy.value}
                  onChange={() => updatePolicy("incarcerated", id)}
                  label={policy.label}
                />
              </FormGridCell>
            );
          })}
        </FormGridColumn>
      </PolicyCheckboxContainer>
    </RateOfSpreadDiv>
  );
};

export default RateOfSpreadSection;
