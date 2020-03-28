import PropTypes from "prop-types";
import React from "react";
import styled from "styled-components";

const Label = styled.span`
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 100;
  font-family: "Poppins", sans-serif;
  letter-spacing: 2px;
  color: #00413e;
`;

const Input = styled.input`
  padding: 16px;
  background: #e0e4e4;
  outline: 0 solid transparent;
  box-shadow: none;
  border: none;
  font-size: 16px;
  border-radius: 2px;
  font-family: "Rubik", sans-serif;
  color: #00413e;
  margin-top: 8px;
`;

const TextInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
`;

interface Props {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  defaultValue?: string;
}

const TextInput: React.FC<Props> = (props) => {
  return (
    <TextInputContainer>
      <Label>{props.label}</Label>
      <Input
        type="text"
        defaultValue={props.defaultValue}
        value={props.value}
        placeholder={props.placeholder}
        onChange={props.onChange}
      />
    </TextInputContainer>
  );
};

TextInput.propTypes = {
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  defaultValue: PropTypes.string,
};
export default TextInput;
