import React, { useEffect, useState } from "react";
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
  height?: string;
  width?: string;
}

const Modal: React.FC<Props> = (props) => {
  const {
    trigger,
    modalTitle,
    children,
    open,
    setOpen,
    height,
    width,
    onClose,
  } = props;
  const [prevOpen, setPrevOpen] = useState(open);

  const closeModal = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (!open && prevOpen && onClose) {
      onClose();
    }
    setPrevOpen(open);
  }, [open, onClose, prevOpen]);

  return (
    <ModalContainer>
      <div onClick={() => setOpen(true)}> {trigger}</div>
      <ModalDialog
        title={modalTitle}
        open={open}
        closeModal={closeModal}
        height={height}
        width={width}
      >
        {children}
      </ModalDialog>
    </ModalContainer>
  );
};

export default Modal;
