import hexalpha from "hex-alpha";
import React, { useState } from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";

interface Props {
  enabled: boolean;
  text?: string | null;
  onDismiss: () => void;
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
  const { text, onDismiss, enabled } = props;
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !text || !enabled) return null;

  const handleOnClick = () => {
    setDismissed(true);
    onDismiss();
  };

  return (
    <PromoBox className="mt-6">
      {text}
      <DismissButton onClick={handleOnClick}>Dismiss</DismissButton>
    </PromoBox>
  );
};

export default PromoBoxWithButton;
