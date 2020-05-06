import { navigate } from "gatsby";
import React, { useState } from "react";
import styled from "styled-components";

import { getFacilities } from "../../database/index";
import Colors from "../../design-system/Colors";
import InputButton from "../../design-system/InputButton";
import ModalDialog from "../../design-system/ModalDialog";
// import nextArrowIcon from "../icons/ic_next_arrow.svg";
import { Facilities, Scenario } from "../../page-multi-facility/types";
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

interface Props {
  scenario: Scenario;
  setBaselinePopulations: React.Dispatch<React.SetStateAction<any>>;
}

const buttonStyle = {
  width: "80px",
  fontFamily: "PingFang SC",
  fontSize: "14px",
  background: "transparent",
  color: Colors.forest,
};

const BaselinePopulationModal: React.FC<Props> = ({
  scenario,
  setBaselinePopulations,
}) => {
  const [page, setPage] = useState(1);

  console.log({ scenario });

  async function onCloseModal() {
    await navigate("/");
  }

  const [facilities, setFacilities] = useState({
    data: [] as Facilities,
    loading: true,
  });

  React.useEffect(() => {
    async function fetchFacilities() {
      if (!scenario.id) return;
      const facilitiesData = await getFacilities(scenario.id);
      if (facilitiesData) {
        setFacilities({
          data: facilitiesData,
          loading: false,
        });
      }
    }

    fetchFacilities();
  }, [scenario.id]);

  const numFacilities = facilities?.data.length;

  console.log({ facilities });
  return (
    <BaselinePopulationContainer>
      <ModalDialog
        open
        closeModal={onCloseModal}
        title={`Generating Report | ${numFacilities} facilities`}
      >
        <ModalContent>
          {page === 1 ? (
            <>
              <Text>
                A report will be generated comparing the current projections
                against the baseline projections for the {numFacilities}{" "}
                facilities you currently have modelled.
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
              setBaselinePopulations={setBaselinePopulations}
            />
          )}
        </ModalContent>
      </ModalDialog>
    </BaselinePopulationContainer>
  );
};

export default BaselinePopulationModal;
