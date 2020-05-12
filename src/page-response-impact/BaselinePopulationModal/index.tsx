import { navigate } from "gatsby";
import React, { useState } from "react";
import styled from "styled-components";

import Colors from "../../design-system/Colors";
import InputButton from "../../design-system/InputButton";
import ModalDialog from "../../design-system/ModalDialog";
import BaselinePopulationForm from "./BaselinePopulationForm";
const BaselinePopulationContainer = styled.div``;

const Text = styled.div`
  color: ${Colors.forest};
  font-family: "Poppins", sans serif;
  font-size: 18px;
  font-weight: normal;
  line-height: 180%;
  padding-top: 20px;
`;

const ModalFooter = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
  padding: 1em 0;
  width: 100%;
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1;
`;

export interface Props {
  open: boolean;
  numFacilities: number;
  defaultStaffPopulation: number;
  defaultIncarceratedPopulation: number;
  saveBaselinePopulations: (populations: any) => void;
}

const buttonStyle = {
  width: "80px",
  fontSize: "14px",
  background: "transparent",
  color: Colors.forest,
};

const Subtitle = styled.span`
  font-weight: normal;

  &::before {
    content: " | ";
    font-weight: bold;
    padding: 0 10px;
  }
`;

type ModalTitleProps = Pick<Props, "numFacilities"> & { page: number };

const ModalTitle: React.FC<ModalTitleProps> = ({ numFacilities, page }) => {
  const pageOneText =
    numFacilities === 1
      ? `${numFacilities} facility`
      : `${numFacilities} facilities`;
  const pageTwoText = "Choose a benchmark";

  return (
    <>
      Impact Report{" "}
      <Subtitle>{page === 1 ? pageOneText : pageTwoText}</Subtitle>
    </>
  );
};

const BaselinePopulationModal: React.FC<Props> = ({
  open,
  numFacilities,
  defaultStaffPopulation,
  defaultIncarceratedPopulation,
  saveBaselinePopulations,
}) => {
  const [page, setPage] = useState(1);

  async function onCloseModal() {
    await navigate("/");
  }

  return (
    <BaselinePopulationContainer>
      <ModalDialog
        open={open}
        closeModal={onCloseModal}
        title={<ModalTitle numFacilities={numFacilities} page={page} />}
      >
        <ModalContent>
          {page === 1 ? (
            <>
              <Text>
                A report will be generated to compare the current projected
                impact of COVID-19 on your system against the model’s original
                assumptions prior to any actions taken. For a complete report,
                ensure all facilities in your system are modelled, even if some
                facilities do not currently have confirmed cases.
              </Text>
              <ModalFooter>
                <InputButton
                  styles={buttonStyle}
                  label="Next >"
                  onClick={() => setPage(2)}
                />
              </ModalFooter>
            </>
          ) : (
            <BaselinePopulationForm
              setPage={() => setPage(1)}
              defaultStaffPopulation={defaultStaffPopulation}
              defaultIncarceratedPopulation={defaultIncarceratedPopulation}
              saveBaselinePopulations={saveBaselinePopulations}
            />
          )}
        </ModalContent>
      </ModalDialog>
    </BaselinePopulationContainer>
  );
};

export default BaselinePopulationModal;
