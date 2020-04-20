import React, { useState } from "react";
import styled from "styled-components";

import Colors from "./Colors";
import ModalDialog from "./ModalDialog";
import { TitleProps } from "./ModalTitle";

const ModalContainer = styled.div``;

const ModalTrigger = styled.button`
  color: ${Colors.green};
  cursor: pointer;
  font-family: "Libre Baskerville", serif;
  font-size: 32px;
  line-height: 32px;
  letter-spacing: -0.03em;
`;

interface Props {
  modalTitle?: TitleProps["title"];
  trigger?: string | React.ReactElement<any>;
  children?: any;
}

const Modal: React.FC<Props> = (props) => {
  const [open, setOpen] = useState(false);
  const { trigger, modalTitle, children } = props;

  return (
    <ModalContainer>
      <ModalTrigger onClick={() => setOpen(true)}>{trigger}</ModalTrigger>
      <ModalDialog
        title={modalTitle}
        open={open}
        closeModal={() => setOpen(false)}
      >
        {children}
      </ModalDialog>
    </ModalContainer>
  );
};

export default Modal;
