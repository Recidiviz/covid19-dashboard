import React from "react";
import styled from "styled-components";

import Colors from "../../../design-system/Colors";
import dataSyncSelectedIcon from "../../../design-system/icons/ic_data_sync_selected.svg";
import dataSyncIcon from "../../../design-system/icons/ic_data_sync.svg";
import { ReferenceFacility } from "../../types";

const Row = styled.div<{ selected: boolean }>`
  border-bottom: 1px solid ${Colors.paleJade20};
  color: ${(props) => (props.selected ? Colors.forest : Colors.paleJade)};
  cursor: pointer;
  display: flex;
  flex-flow: row nowrap;
  font-family: "Libre Franklin", sans serif;
  font-size: 15px;
  line-height: 16px;
  letter-spacing: -0.01em;
  padding: 24px 0;
`;

const RowIcon = styled.img`
  margin-right: 12px;
`;

interface ReferenceFacilityRowProps {
  referenceFacility: ReferenceFacility;
  onClick: () => void;
  selected: boolean;
}

const ReferenceFacilityRow: React.FC<ReferenceFacilityRowProps> = ({
  referenceFacility,
  onClick,
  selected,
}) => {
  return (
    <Row selected={selected} onClick={onClick}>
      <RowIcon
        src={selected ? dataSyncSelectedIcon : dataSyncIcon}
        alt="data sync icon"
      />
      {referenceFacility.canonicalName}
    </Row>
  );
};

export default ReferenceFacilityRow;
