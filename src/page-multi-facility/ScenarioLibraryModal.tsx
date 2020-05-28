import React, { useEffect, useState } from "react";
import styled from "styled-components";

import {
  deleteScenario,
  duplicateScenario,
  getScenarios,
  currrentUserId,
} from "../database";
import Colors from "../design-system/Colors";
import { DateMMMMdyyyy } from "../design-system/DateFormats";
import iconSrcCheck from "../design-system/icons/ic_check.svg";
import iconSrcRecidiviz from "../design-system/icons/ic_recidiviz.svg";
import { StyledButton } from "../design-system/InputButton";
import Loading from "../design-system/Loading";
import Modal, { Props as ModalProps } from "../design-system/Modal";
import ModalDialog from "../design-system/ModalDialog";
import PopUpMenu from "../design-system/PopUpMenu";
import useRejectionToast from "../hooks/useRejectionToast";
import useScenario from "../scenario-context/useScenario";
import { Scenario } from "./types";

const ModalContents = styled.div`
  display: flex;
  flex-direction: column;
  font-weight: normal;
  justify-content: flex-start;
  margin-top: 30px;
  height: 100%;

  h3 {
    border-bottom: 0.5px solid #c8d3d3;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 30px;
    padding: 20px 0;
  }
`;

const ScenarioLibrary = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  height: 100%;
`;

const ScenarioCard = styled.div`
  display: inline;
  border: 1px solid ${Colors.darkGray};
  border-radius: 0.25em;
  cursor: pointer;
  margin-bottom: 25px;
  height: 330px;
  width: 330px;
`;

const ScenarioHeader = styled.div`
  display: flex;
  padding: 1.5rem 1rem 0.25rem 1rem;
`;

const ScenarioHeaderText = styled.h1`
  color: ${Colors.forest};
  font-family: "Libre Baskerville", serif;
  font-size: 24px;
  letter-spacing: -0.06em;
  line-height: 24px;
  text-align: left;
  padding-bottom: 0.75rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ScenarioDataViz = styled.div`
  color: ${Colors.opacityGray};
  display: flex;
  height: 45%;
  background-color: ${Colors.gray};
`;

const ScenarioDescription = styled.div`
  color: ${Colors.opacityForest};
  font-family: "Poppins";
  font-size: 13px;
  line-height: 20px;
  letter-spacing: -0.03em;
  min-height: 18%;
  padding: 1rem 1rem 0rem 1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const ScenarioFooter = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1.75rem 1rem 0.25rem 1rem;
`;

const LastUpdatedLabel = styled.div`
  color: ${Colors.forest50};
  font-family: "Poppins";
  font-size: 10px;
  font-style: normal;
  font-weight: 600;
  letter-spacing: -0.03em;
`;

interface IconCheckProps {
  baseline?: boolean;
}

const IconCheck = styled.img<IconCheckProps>`
  display: ${(props) => (props.baseline ? "inline" : "none")};
  width: 20px;
  height: 20px;
  margin-right: 8px;
`;

const IconRecidviz = styled.img`
  width: 50px;
  height: 50px;
  margin: auto;
`;

const DeleteModalContents = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  font-weight: normal;
  justify-content: flex-start;
  margin-top: 30px;
`;

const ModalText = styled.div`
  font-size: 13px;
  margin-bottom: 25px;
`;

const ModalButtons = styled.div`
  /* display: flex;
  flex-direction: column; */
`;

const ModalButton = styled(StyledButton)`
  font-size: 14px;
  font-weight: normal;
`;

const DeleteButton = styled(ModalButton)`
  background: ${Colors.darkRed};
  color: ${Colors.white};
  margin-right: 15px;
`;

const CancelButton = styled(ModalButton)`
  background: transparent;
  border: 1px solid ${Colors.forest};
  color: ${Colors.forest};
`;

type Props = Pick<ModalProps, "trigger">;

const ScenarioLibraryModal: React.FC<Props> = ({ trigger }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentScenario, dispatchScenarioUpdate] = useScenario();
  const [ownedScenarios, setOwnedScenarios] = useState({
    data: [] as Scenario[],
    loading: true,
  });
  const [sharedScenarios, setSharedScenarios] = useState({
    data: [] as Scenario[],
    loading: true,
  });
  const [baselineScenario, setBaselineScenario] = useState<Scenario | null>();
  const [scenarioIdPendingDeletion, setScenarioIdPendingDeletion] = useState<
    string | null
  >();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const rejectionToast = useRejectionToast();

  const sortScenarios = (list: any) => {
    if (Array.isArray(list)) {
      const baseline: any = [];
      const nonBaseline: any = [];
      list.forEach((scenario: any) => {
        if (scenario.baseline) baseline.push(scenario);
        else nonBaseline.push(scenario);
      });

      baseline.sort((a: any, b: any) =>
        a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1,
      );
      nonBaseline.sort((a: any, b: any) =>
        a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1,
      );

      return [...baseline, ...nonBaseline];
    } else {
      return list;
    }
  };

  async function fetchScenarios() {
    const scenariosData = await getScenarios();
    if (scenariosData) {
      const oScenarios = [] as Scenario[];
      const sScenarios = [] as Scenario[];
      const userId = currrentUserId();

      scenariosData.forEach((scenario) => {
        if (userId && scenario.roles[userId] === "owner") {
          oScenarios.push(scenario);
        } else {
          sScenarios.push(scenario);
        }
      });

      setOwnedScenarios({
        data: oScenarios,
        loading: false,
      });

      setSharedScenarios({
        data: sortScenarios(sScenarios),
        loading: false,
      });

      setBaselineScenario(scenariosData.find((scenario) => scenario.baseline));
    }
  }

  useEffect(() => {
    fetchScenarios();
  }, []);

  const openDeleteModal = (scenarioId: string) => {
    setScenarioIdPendingDeletion(scenarioId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = (event: React.MouseEvent<Element>) => {
    // Needed so that the parent modal stays open after canceling or
    // confirming a deletion.
    event.stopPropagation();
    event.preventDefault();
    setScenarioIdPendingDeletion(null);
    setShowDeleteModal(false);
  };

  const copyScenario = (scenarioId: string) => {
    setOwnedScenarios({
      data: [],
      loading: true,
    });

    duplicateScenario(scenarioId).then(() => {
      fetchScenarios();
    });
  };

  const changeScenario = (scenario: Scenario) => {
    dispatchScenarioUpdate(scenario);
    setModalOpen(false);
  };

  const removeScenario = (event: React.MouseEvent<Element>) => {
    if (scenarioIdPendingDeletion) {
      rejectionToast(
        deleteScenario(scenarioIdPendingDeletion).then(() => {
          // refresh scenario data after delete
          setOwnedScenarios({
            data: [],
            loading: true,
          });
          fetchScenarios().then(() => {
            // If we delete the scenario that the user is currently viewing we reset the
            // currently viewed scenario to be the baseline. Unlike deleting a scenario
            // that is not currently being viewed, this will close the Scenario Library
            // modal which is the expected behavior.
            if (
              scenarioIdPendingDeletion == currentScenario?.data?.id &&
              baselineScenario
            ) {
              dispatchScenarioUpdate(baselineScenario);
            }
          });
        }),
      );
    }

    closeDeleteModal(event);
  };

  return (
    <Modal
      modalTitle="Library"
      open={modalOpen}
      setOpen={setModalOpen}
      trigger={trigger}
      height="90vh"
      width="45vw"
    >
      <ModalContents>
        <ScenarioLibrary>
          {ownedScenarios?.loading ? (
            <Loading />
          ) : (
            ownedScenarios?.data.map((scenario) => {
              const popupItems = [
                { name: "Duplicate", onClick: () => copyScenario(scenario.id) },
              ];

              // Only show the Delete option for non-baseline scenarios
              if (!scenario.baseline) {
                popupItems.push({
                  name: "Delete",
                  onClick: () => openDeleteModal(scenario.id),
                });
              }

              return (
                <ScenarioCard
                  key={scenario.id}
                  onClick={() => changeScenario(scenario)}
                >
                  <ScenarioHeader>
                    <IconCheck
                      alt="check"
                      src={iconSrcCheck}
                      baseline={scenario.baseline}
                    />
                    <ScenarioHeaderText>{scenario.name}</ScenarioHeaderText>
                  </ScenarioHeader>
                  <ScenarioDataViz>
                    <IconRecidviz alt="Recidiviz" src={iconSrcRecidiviz} />
                  </ScenarioDataViz>
                  <ScenarioDescription>
                    {scenario.description}
                  </ScenarioDescription>
                  <ScenarioFooter>
                    <LastUpdatedLabel>
                      Last Update: <DateMMMMdyyyy date={scenario.updatedAt} />
                    </LastUpdatedLabel>
                    <PopUpMenu items={popupItems} />
                  </ScenarioFooter>
                </ScenarioCard>
              );
            })
          )}
          <ModalDialog
            closeModal={closeDeleteModal}
            open={showDeleteModal}
            title="Are you sure?"
            width="41vw"
          >
            <DeleteModalContents>
              <ModalText>
                This action can't be undone. When deleting the scenario
                currently being viewed, users will be returned to their baseline
                scenario.
              </ModalText>
              <ModalButtons>
                <DeleteButton label="Delete scenario" onClick={removeScenario}>
                  Delete scenario
                </DeleteButton>
                <CancelButton onClick={closeDeleteModal}>Cancel</CancelButton>
              </ModalButtons>
            </DeleteModalContents>
          </ModalDialog>
        </ScenarioLibrary>

        {sharedScenarios?.data?.length ? <h3>Shared Scenarios</h3> : null}
        <ScenarioLibrary>
          {sharedScenarios?.data.length && sharedScenarios?.loading ? (
            <Loading />
          ) : (
            sharedScenarios?.data.map((scenario) => {
              const popupItems = [
                { name: "Duplicate", onClick: () => copyScenario(scenario.id) },
              ];

              return (
                <ScenarioCard
                  key={scenario.id}
                  onClick={() => changeScenario(scenario)}
                >
                  <ScenarioHeader>
                    <IconCheck
                      alt="check"
                      src={iconSrcCheck}
                      baseline={scenario.baseline}
                    />
                    <ScenarioHeaderText>{scenario.name}</ScenarioHeaderText>
                  </ScenarioHeader>
                  <ScenarioDataViz>
                    <IconRecidviz alt="Recidiviz" src={iconSrcRecidiviz} />
                  </ScenarioDataViz>
                  <ScenarioDescription>
                    {scenario.description}
                  </ScenarioDescription>
                  <ScenarioFooter>
                    <LastUpdatedLabel>
                      Last Update: <DateMMMMdyyyy date={scenario.updatedAt} />
                    </LastUpdatedLabel>
                    <PopUpMenu items={popupItems} />
                  </ScenarioFooter>
                </ScenarioCard>
              );
            })
          )}
        </ScenarioLibrary>
      </ModalContents>
    </Modal>
  );
};

export default ScenarioLibraryModal;
