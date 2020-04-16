import React, { useState } from "react";
import styled from "styled-components";

import Colors from "./Colors";
import ModalDialog from "./ModalDialog";

const ModalContainer = styled.div``;

const ModalTrigger = styled.div`
  color: ${Colors.green};
  cursor: pointer;
  font-size: 14px;
`;

interface Props {
  modalTitle?: string;
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
        onClick={() => setOpen(false)}
      >
        {children}
      </ModalDialog>
    </ModalContainer>
  );
};

export default Modal;
