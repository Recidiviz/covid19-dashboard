import "./react-datepicker.module.css";

import React from "react";
import CustomDatePicker from "react-datepicker";
import styled from "styled-components";

import { Label } from "./form-styles";

interface Props {
  date?: Date;
  setDate: (date: Date) => void;
}

const DatePickerContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
`;

const DatePicker: React.FC<Props> = (props) => {
  return (
    <DatePickerContainer>
      <Label>When did this occur?</Label>
      <CustomDatePicker selected={props.date} onChange={props.setDate} />
    </DatePickerContainer>
  );
};

export default DatePicker;
