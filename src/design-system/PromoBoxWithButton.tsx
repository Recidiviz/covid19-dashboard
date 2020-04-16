import React, { useState } from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";

interface Props {
  text?: string;
}

const DismissButton = styled.div`
  font-weight: 500;
  cursor: pointer;
  padding-top: 10px;
  font-size: 10px;
`;

const PromoBox = styled.div`
  color: ${Colors.forest};
  background: ${Colors.gray};
  border-radius: 2px;
  font-family: "Poppins", sans-serif;
  font-size: 12px;
  font-weight: 100;
  margin-top: 16px;
  padding: 16px;
`;

const PromoBoxWithButton: React.FC<Props> = (props) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !props.text) return null;

  return (
    <PromoBox>
      {props.text}
      <DismissButton onClick={() => setDismissed(true)}>Dismiss</DismissButton>
    </PromoBox>
  );
};

export default PromoBoxWithButton;
