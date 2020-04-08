import HelpButtonWithTooltip from "./HelpButtonWithTooltip";
import TextLabel from "./TextLabel";

interface Props {
  label?: React.ReactNode;
  labelHelp?: React.ReactNode;
}

const InputLabelAndHelp: React.FC<Props> = (props) => {
  if (!props.label && !props.labelHelp) {
    return null;
  }

  return (
    <div>
      <TextLabel>{props.label}</TextLabel>
      {props.labelHelp && (
        <HelpButtonWithTooltip>{props.labelHelp}</HelpButtonWithTooltip>
      )}
    </div>
  );
};

export default InputLabelAndHelp;
