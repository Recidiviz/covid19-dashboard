import React from "react";
import styled from "styled-components";

import InputSelect from "../design-system/InputSelect";

const SystemTypeInputDiv = styled.div`
  width: 195px;
  padding-bottom: 20px;
`;

interface Props {
  systemType?: string;
  setSystemType: (systemType?: string) => void;
}

const SystemTypeSelection: React.FC<Props> = ({
  systemType,
  setSystemType,
}) => {
  const systemTypeList = [
    { value: undefined },
    { value: "State Prison" },
    { value: "County Jail" },
  ];

  return (
    <SystemTypeInputDiv>
      <InputSelect
        label="Type of System"
        value={systemType}
        onChange={(event) => setSystemType(event.target.value)}
      >
        {systemTypeList.map(({ value }, index) => (
          <option key={value || `system-type-${index}`} value={value}>
            {value}
          </option>
        ))}
      </InputSelect>
    </SystemTypeInputDiv>
  );
};

export default SystemTypeSelection;
