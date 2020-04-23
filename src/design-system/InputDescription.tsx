import React, { useState } from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import InputTextArea from "../design-system/InputTextArea";

const inputTextAreaStyle = {
  fontFamily: "Helvetica Neue",
  fontSize: "13px",
  color: Colors.forest,
};

interface Props {
  description?: string | undefined;
  setDescription: (description?: string) => void;
}

const InputDescription: React.FC<Props> = ({
  description,
  setDescription,
}) => {

  const onEnterPress = (event: React.KeyboardEvent, onEnter: Function) => {
    if (event.key !== "Enter") return;
    onEnter();
  };

  return (
    <div className="mb-12">
      <InputTextArea
        fillVertical
        style={inputTextAreaStyle}
        autoResizeVertically
        value={description}
        placeholder={""}
        onBlur={() => setDescription(description)}
        onChange={(event) => setDescription(event.target.value)}
        onKeyDown={(event) =>
          onEnterPress(event, () => setDescription(description))
        }
      />
    </div>
  );
};

export default InputDescription;
