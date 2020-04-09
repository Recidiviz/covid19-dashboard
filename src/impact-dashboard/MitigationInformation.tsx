import { cloneDeep } from "lodash";
import { useState } from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import InputText from "../design-system/InputText";
import InputTextNumeric from "../design-system/InputTextNumeric";
import Description from "./Description";
import { FormGrid, FormGridCell, FormGridRow } from "./FormGrid";

// TODO: date should be a date
type PlannedRelease = { date?: string; count?: number };
type PlannedReleases = PlannedRelease[];
type ReleaseUpdate = {
  index: number;
  update: PlannedRelease;
};

type RowProps = PlannedRelease & {
  index: number;
  updateRelease: (opts: ReleaseUpdate) => void;
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

const Row: React.FC<RowProps> = ({ date, count, index, updateRelease }) => (
  <FormGridRow>
    <FormGridCell>
      <InputText
        labelAbove={index === 0 ? "Release date" : undefined}
        labelHelp={
          index === 0
            ? `Enter the date of any planned reductions in the in-facility
               population below (e.g., early releases to supervision).`
            : undefined
        }
        type="text"
        valueEntered={date}
        onValueChange={(value) =>
          updateRelease({ index, update: { date: value } })
        }
      />
    </FormGridCell>
    <FormGridCell>
      <InputTextNumeric
        labelAbove={index === 0 ? "Number released" : undefined}
        labelHelp={
          index === 0
            ? "Enter the number of incarcerated you plan to release."
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
  // TODO: temporary state for development. add this to context
  // all updates should be happen on the mutable copy of state,
  // which will replace the state after user input
  const [releases, updateReleases] = useState<PlannedReleases>([{}]);
  const mutableReleases = cloneDeep(releases);

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
        Enter planned reductions in the in-facility population (e.g., early
        releases to supervision).
      </Description>
      <FormGrid>
        {mutableReleases.map(({ date, count }, index) => (
          <>
            <Row
              key={index}
              date={date}
              count={count}
              index={index}
              updateRelease={updateRelease}
            />
          </>
        ))}
      </FormGrid>
      <ButtonAdd onClick={addEmptyRelease}>
        Add another planned reduction
      </ButtonAdd>
    </Container>
  );
};

export default MitigationInformation;
