import React from "react";
import styled from "styled-components";

import HelpButtonWithTooltip from "./HelpButtonWithTooltip";
import TextLabel from "./TextLabel";

interface Props {
  label?: React.ReactNode;
  labelHelp?: React.ReactNode;
  softened?: boolean;
  placement:
    | "auto"
    | "auto-start"
    | "auto-end"
    | "top"
    | "top-start"
    | "top-end"
    | "bottom"
    | "bottom-start"
    | "bottom-end"
    | "right"
    | "right-start"
    | "right-end"
    | "left"
    | "left-start"
    | "left-end";
}

const LabelContainer = styled.div`
  align-items: baseline;
  display: flex;
  justify-content: space-between;
`;

const InputLabelAndHelp: React.FC<Props> = (props) => {
  if (!props.label && !props.labelHelp) {
    return null;
  }

  return (
    <LabelContainer>
      <TextLabel softened={props.softened}>{props.label}</TextLabel>
      {props.labelHelp && (
        <HelpButtonWithTooltip placement={props.placement}>
          {props.labelHelp}
        </HelpButtonWithTooltip>
      )}
    </LabelContainer>
  );
};

export default InputLabelAndHelp;
