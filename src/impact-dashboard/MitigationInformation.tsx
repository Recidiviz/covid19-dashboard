import { cloneDeep } from "lodash";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import InputDate from "../design-system/InputDate";
import InputTextNumeric from "../design-system/InputTextNumeric";
import Description from "./Description";
import { PlannedRelease, PlannedReleases } from "./EpidemicModelContext";
import { FormGrid, FormGridCell, FormGridRow } from "./FormGrid";
import useModel from "./useModel";

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
  const [{ plannedReleases = [{}] }, updateModel] = useModel();
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
        Enter planned reductions in the in-facility population (e.g., early
        releases to supervision).
      </Description>
      <FormGrid>
        {mutableReleases?.map(({ date, count }, index) => (
          <Row
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
