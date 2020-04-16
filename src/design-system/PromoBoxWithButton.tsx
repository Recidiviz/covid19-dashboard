import React, { useState } from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";

interface Props {
  text?: string;
}

const StyledButton = styled.div`
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

  const handleClick = () => {
    dismissed ? true : setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <PromoBox>
      {props.text}
      <StyledButton onClick={() => handleClick()}>Dismiss</StyledButton>
    </PromoBox>
  );
};

export default PromoBoxWithButton;
