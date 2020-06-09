import React, { useState } from "react";
import styled from "styled-components";

import { duplicateScenario } from "../database";
import Colors from "../design-system/Colors";
import iconEyeSrc from "../design-system/icons/ic_eye.svg";
import iconRecidivizSrc from "../design-system/icons/ic_recidiviz_color.svg";
import Loading from "../design-system/Loading";
import ModalDialog from "../design-system/ModalDialog";
import useReadOnlyMode from "../hooks/useReadOnlyMode";
import { Scenario } from "./types";

interface BannerProps {
  visible: boolean;
}

const Banner = styled.div<BannerProps>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${Colors.forest};
  color: ${Colors.slate};
  font-family: "Helvetica Neue", sans serif;
  font-weight: normal;
  letter-spacing: 0;
  padding: 20px;
  height: ${(props) => (props.visible ? "64px" : "0px")};
  position: relative;
  top: ${(props) => (props.visible ? "0px" : "-64px")};
  transition: top 250ms ease;
`;

const BannerMessage = styled.div`
  display: flex;
`;

const IconEye = styled.img`
  display: inline;
  width: 16px;
  height: 16px;
  margin-right: 10px;
`;

const Logo = styled.img`
  display: inline;
  width: 26px;
  height: 26px;
  margin-right: 10px;
`;

const Anchor = styled.a`
  &:hover {
    text-decoration: underline;
  }
`;

interface Props {
  scenario: Scenario;
  dispatchScenarioUpdate: Function;
}

const ReadOnlyScenarioBanner: React.FC<Props> = (props) => {
  const { scenario, dispatchScenarioUpdate } = props;
  const readOnlyMode = useReadOnlyMode(scenario);
  const [modalOpen, setModalOpen] = useState(false);

  const duplicate = (scenarioId: string) => {
    setModalOpen(true);
    duplicateScenario(scenarioId).then((scenario) => {
      setModalOpen(false);
      dispatchScenarioUpdate(scenario);
    });
  };

  return (
    <Banner visible={readOnlyMode}>
      <Logo alt="Recidiviz" src={iconRecidivizSrc} />
      <BannerMessage>
        <IconEye alt="folder" src={iconEyeSrc} />
        View Only Mode. No edits can be made to this scenario.
      </BannerMessage>
      <Anchor href="#" onClick={() => duplicate(scenario.id)}>
        Duplicate
      </Anchor>
      <ModalDialog
        title={`Duplicating ${scenario.name}`}
        open={modalOpen}
        height="30vh"
        width="25vw"
      >
        <Loading />
      </ModalDialog>
    </Banner>
  );
};

export default ReadOnlyScenarioBanner;
