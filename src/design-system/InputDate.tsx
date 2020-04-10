import hexAlpha from "hex-alpha";
import DatePicker from "react-date-picker";
import styled from "styled-components";

import Colors from "./Colors";
import { InputBaseProps, useInputValue } from "./Input";
import InputLabelAndHelp from "./InputLabelAndHelp";

const InputContainer = styled.div`
  .react-date-picker {
    display: flex;
    width: 100%;

    &__wrapper {
      background: #e0e4e4;
      border-radius: 2px;
      border: none;
      box-shadow: none;
      color: #00413e;
      flex: 1 1 auto;
      font-family: "Rubik", sans-serif;
      font-size: 16px;
      font-weight: 400;
      margin-top: 8px;
      outline: 0 solid transparent;
      padding: 16px;
    }
  }

  .react-calendar {
    background: #e9ecec;
    color: ${Colors.forest};
    font-family: "Poppins", sans-serif;

    &__navigation {
      & button {
        &:enabled {
          &:hover,
          &:focus {
            background: ${hexAlpha(Colors.grey, 0.5)};
          }
        }
      }
    }

    &__tile {
      &:hover {
        background: ${hexAlpha(Colors.grey, 0.5)};
      }
      &--hasActive {
        background: ${hexAlpha(Colors.green, 0.3)};
      }
      &--now {
        background: ${hexAlpha(Colors.green, 0.1)};

        &:hover {
          background: ${hexAlpha(Colors.green, 0.2)};
        }
      }
    }

    &__month-view {
      &__days {
        &__day {
          &--weekend {
            color: ${Colors.red};
          }
        }
      }
    }
  }
`;

const InputDate: React.FC<InputBaseProps<Date>> = (props) => {
  const { labelAbove, labelHelp, onValueChange } = props;
  const inputValue = useInputValue(props);

  return (
    <InputContainer>
      <InputLabelAndHelp label={labelAbove} labelHelp={labelHelp} />
      <DatePicker
        calendarIcon={null}
        clearIcon={null}
        dayPlaceholder="dd"
        minDetail="year"
        monthPlaceholder="mm"
        onChange={(value) =>
          value instanceof Date
            ? onValueChange(value)
            : // if for some reason this is set to return a range of dates,
              // ignore the end date
              onValueChange(value[0])
        }
        value={inputValue}
        yearPlaceholder="yyyy"
      />
    </InputContainer>
  );
};

export default InputDate;