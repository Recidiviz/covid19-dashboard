import React, { useState } from "react";
import styled from "styled-components";

import Colors from "../../../design-system/Colors";
import InputToggle from "../../../design-system/InputToggle";
import { Facility, ModelInputs } from "../../types";

const SyncReferenceFacilitiesToggleContainer = styled.div`
  border-bottom: 0.5px solid ${Colors.darkGray};
  color: ${Colors.forest};
  display: flex;
  font-family: Libre Franklin;
  font-style: normal;
  font-weight: normal;
  font-size: 15px;
  justify-content: space-between;
  letter-spacing: -0.01em;
  padding: 25px 0px 25px 0px;
`;

const SyncReferenceFacilitiesToggleLabels = styled.div`
  display: flex;
  justify-content: space-between;
`;

const SyncReferenceFacilitiesToggleLabel = styled.div`
  margin-right: 25px;
`;

interface Props {
  stateName: ModelInputs["stateName"];
  systemType: Facility["systemType"];
  useReferenceData?: boolean;
  callback: (useReferenceData: boolean) => void;
}

const SyncReferenceFacilitiesToggle: React.FC<Props> = ({
  stateName,
  systemType,
  useReferenceData,
  callback,
}) => {
  const [toggled, setToggled] = useState(
    useReferenceData === undefined || useReferenceData,
  );

  const onToggle = async () => {
    setToggled(!toggled);
    callback(!toggled);
  };

  return (
    <SyncReferenceFacilitiesToggleContainer>
      <SyncReferenceFacilitiesToggleLabels>
        <SyncReferenceFacilitiesToggleLabel>
          State: {stateName}
        </SyncReferenceFacilitiesToggleLabel>
        <SyncReferenceFacilitiesToggleLabel>
          Type of System: {systemType}
        </SyncReferenceFacilitiesToggleLabel>
      </SyncReferenceFacilitiesToggleLabels>
      <InputToggle toggled={toggled} onChange={onToggle} />
    </SyncReferenceFacilitiesToggleContainer>
  );
};

export default SyncReferenceFacilitiesToggle;
