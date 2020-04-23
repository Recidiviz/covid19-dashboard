import hexalpha from "hex-alpha";
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
  color: ${hexalpha(Colors.forest, 0.7)};
  background: ${Colors.gray};
  border-radius: 2px;
  font-family: "Helvetica Neue", sans-serif;
  font-size: 12px;
  line-height: 1.5;
  font-weight: normal;
  padding: 16px;
`;

const PromoBoxWithButton: React.FC<Props> = (props) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !props.text) return null;

  return (
    <PromoBox className="mt-6">
      {props.text}
      <DismissButton onClick={() => setDismissed(true)}>Dismiss</DismissButton>
    </PromoBox>
  );
};

export default PromoBoxWithButton;
