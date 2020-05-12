// Parcel cannot import CSS for server-side rendering; this is a known and unresolved bug
// (https://github.com/parcel-bundler/parcel/issues/1015)
// so we have to duplicate the styles manually to work around this problem
// and import the "nostyle" version of the package below
import "./InputDate.css";

import hexAlpha from "hex-alpha";
import React from "react";
import DatePicker from "react-date-picker/dist/entry.nostyle";
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
      color: ${Colors.green};
      flex: 1 1 auto;
      font: 13px/16px "Poppins", sans-serif;
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
            background: ${hexAlpha(Colors.paleGreen, 0.5)};
          }
        }
      }
    }

    &__tile {
      &:hover {
        background: ${hexAlpha(Colors.paleGreen, 0.5)};
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
      {labelAbove && (
        <InputLabelAndHelp label={labelAbove} labelHelp={labelHelp} />
      )}
      <DatePicker
        calendarIcon={null}
        clearIcon={null}
        dayPlaceholder="dd"
        minDetail="year"
        monthPlaceholder="mm"
        onChange={(value) =>
          value instanceof Date
            ? onValueChange(value)
            : Array.isArray(value)
            ? // if for some reason this is set to return a range of dates,
              // ignore the end date
              onValueChange(value[0])
            : // could be null if value was deleted
              onValueChange(value)
        }
        value={inputValue}
        yearPlaceholder="yyyy"
      />
    </InputContainer>
  );
};

export default InputDate;
