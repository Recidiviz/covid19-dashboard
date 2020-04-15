import React from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";

import Colors from "./Colors";
import closeIcon from "./icons/ic_close.svg";

const BackgroundAside = styled.aside`
  align-items: center;
  background-color: rgb(214, 215, 215, 0.8);
  display: flex;
  height: 100%;
  justify-content: center;
  position: absolute;
  top: 0;
  width: 100%;
`;

const ModalContainer = styled.div`
  align-self: center;
  background-color: ${Colors.slate};
  border-radius: 5px;
  height: 90vh;
  width: 65vw;
  padding: 35px;
  position: static;
`;

const ModalTitleContainer = styled.div`
  border-bottom: 0.5px solid #c8d3d3;
  display: inline-block;
  font-size: 14px;
  font-family: "Poppins", sans-serif;
  padding-bottom: 20px;
  width: 100%;
`;

const CloseButtonImg = styled.img`
  display: inline-block;
  height: 20px;
  padding: 0 1em;
  float: right;
`;

interface Props {
  title?: string;
  open?: boolean;
  onClose?: (e: React.MouseEvent<HTMLElement>) => void;
  children?: React.ReactElement<any>;
}

const ModalDialog: React.FC<Props> = (props) => {
  const { title, open, onClose, children } = props;

  if (!open) return null;

  return ReactDOM.createPortal(
    <BackgroundAside onClick={onClose}>
      <ModalContainer>
        <ModalTitleContainer>
          {title}
          <CloseButtonImg
            onClick={onClose}
            src={closeIcon}
            alt="close button"
            role="button"
          />
        </ModalTitleContainer>
        {children}
      </ModalContainer>
    </BackgroundAside>,
    document.getElementById("app") as HTMLElement,
  );
};

export default ModalDialog;
