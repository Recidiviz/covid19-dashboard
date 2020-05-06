import React from "react";
import styled from "styled-components";

import ModalDialog from "./ModalDialog";
import { TitleProps } from "./ModalTitle";

const ModalContainer = styled.div``;

export interface Props {
  modalTitle?: TitleProps["title"];
  onClose?: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  trigger?: string | React.ReactElement<any>;
}

const Modal: React.FC<Props> = (props) => {
  const { trigger, modalTitle, children, open, setOpen } = props;

  const closeModal = () => {
    if (props.onClose) {
      props.onClose();
    }
    setOpen(false);
  };

  return (
    <ModalContainer>
      <div onClick={() => setOpen(true)}> {trigger}</div>
      <ModalDialog title={modalTitle} open={open} closeModal={closeModal}>
        {children}
      </ModalDialog>
    </ModalContainer>
  );
};

export default Modal;
