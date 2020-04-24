import { cloneDeep } from "lodash";
import React from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import InputDate from "../design-system/InputDate";
import InputSelect from "../design-system/InputSelect";
import InputTextNumeric from "../design-system/InputTextNumeric";
import Description from "./Description";
import {
  PlannedRelease,
  PlannedReleases,
  RateOfSpread,
} from "./EpidemicModelContext";
import { FormGrid, FormGridCell, FormGridRow } from "./FormGrid";
import useModel from "./useModel";

export type ReleaseUpdate = {
  index: number;
  update: PlannedRelease;
};

type RowProps = PlannedRelease & {
  index: number;
  updateRelease: (opts: ReleaseUpdate) => void;
};

export const rateOfSpreadDisplayText: { [key in RateOfSpread]: string } = {
  low:
    "Low – we've reduced unnecessary interpersonal contact and quarantined at-risk groups",
  moderate:
    "Moderate – we've taken some steps to reduce contact but are still working on others",
  high: "High – we've taken very few steps to reduce contact",
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const ButtonAdd = styled.button`
  align-self: center;
  background-color: transparent;
  border: 1px solid ${Colors.forest};
  border-radius: 2px;
  color: ${Colors.forest};
  flex: 0 0 auto;
  font-family: "Poppins", sans-serif;
  font-size: 12px;
  padding: 8px 16px;
`;

export const ReleaseRow: React.FC<RowProps> = ({
  date,
  count,
  index,
  updateRelease,
}) => (
  <FormGridRow>
    <FormGridCell width={50}>
      <InputDate
        labelAbove={index === 0 ? "Release date" : undefined}
        labelHelp={
          index === 0
            ? `Enter the date of any planned reductions in the in-facility
               population below (e.g., early releases to supervision).`
            : undefined
        }
        valueEntered={date}
        onValueChange={(value) =>
          updateRelease({ index, update: { date: value } })
        }
      />
    </FormGridCell>
    <FormGridCell width={50}>
      <InputTextNumeric
        labelAbove={index === 0 ? "Number released" : undefined}
        labelHelp={
          index === 0
            ? "Enter the number of incarcerated people you plan to release."
            : undefined
        }
        type="number"
        valueEntered={count}
        onValueChange={(value) =>
          updateRelease({ index, update: { count: value } })
        }
      />
    </FormGridCell>
  </FormGridRow>
);

const MitigationInformation: React.FC = () => {
  const [
    { plannedReleases = [{}], rateOfSpreadFactor },
    updateModel,
  ] = useModel();
  // all updates should be happen on this mutable copy,
  // which will replace the model state after user input
  const mutableReleases = cloneDeep(plannedReleases);

  const updateReleases = (newValue: PlannedReleases): void => {
    updateModel({ plannedReleases: newValue });
  };

  const updateRelease = (opts: ReleaseUpdate): void => {
    const { index, update } = opts;
    mutableReleases[index] = Object.assign(
      mutableReleases[index] || {},
      update,
    );
    updateReleases(mutableReleases);
  };

  const addEmptyRelease = (): void => {
    mutableReleases.push({});
    updateReleases(mutableReleases);
  };

  return (
    <Container>
      <Description>
        Select the most likely rate of spread. This will change the R0 (rate of
        spread) in the model.
      </Description>
      <FormGrid>
        <FormGridRow>
          <FormGridCell>
            <InputSelect
              label="Rate of spread"
              onChange={(e) =>
                updateModel({
                  rateOfSpreadFactor: e.target.value as RateOfSpread,
                })
              }
              value={rateOfSpreadFactor}
            >
              {Object.values(RateOfSpread).map((val) => (
                <option key={val} value={val}>
                  {rateOfSpreadDisplayText[val]}
                </option>
              ))}
            </InputSelect>
          </FormGridCell>
        </FormGridRow>
      </FormGrid>
      <Description>
        Enter planned reductions in the in-facility population (e.g., early
        releases to supervision).
      </Description>
      <FormGrid>
        {mutableReleases?.map(({ date, count }, index) => (
          <ReleaseRow
            key={index}
            date={date}
            count={count}
            index={index}
            updateRelease={updateRelease}
          />
        ))}
      </FormGrid>
      <ButtonAdd onClick={addEmptyRelease}>
        Add another planned reduction
      </ButtonAdd>
    </Container>
  );
};

export default MitigationInformation;
