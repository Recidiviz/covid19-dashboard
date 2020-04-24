import styled from "styled-components";

import HelpButtonWithTooltip from "./HelpButtonWithTooltip";
import TextLabel from "./TextLabel";

interface Props {
  label?: React.ReactNode;
  labelHelp?: React.ReactNode;
  softened?: boolean;
}

const LabelContainer = styled.div`
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
        <HelpButtonWithTooltip>{props.labelHelp}</HelpButtonWithTooltip>
      )}
    </LabelContainer>
  );
};

export default InputLabelAndHelp;
