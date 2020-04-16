import React, { useRef } from "react";
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
  display: flex;
  flex-direction: column;
  height: 90vh;
  width: 65vw;
  padding: 35px;
  position: static;
`;

const ModalTitleContainer = styled.div`
  display: inline-block;
  font-size: 14px;
  font-family: "Poppins", sans-serif;
  padding-bottom: 20px;
  width: 100%;
`;

const ModalContentContainer = styled.div`
  border-top: 0.5px solid ${Colors.darkGray};
  flex: 1 1;
`;

const CloseButtonImg = styled.img`
  display: inline-block;
  height: 20px;
  padding: 0 1em;
  float: right;
`;

interface Props {
  numSteps?: number;
  title?: string;
  open?: boolean;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  children?: React.ReactElement<any>;
}

const isOutsideModal = (
  event: React.MouseEvent<HTMLElement>,
  element: HTMLDivElement | null,
) =>
  event.target instanceof HTMLElement &&
  element &&
  !element.contains(event.target);

const ModalDialog: React.FC<Props> = (props) => {
  const { title, open, onClick, children } = props;
  const ref = useRef<HTMLDivElement>(null);

  if (!open) return null;

  const handleOnClick = (event: React.MouseEvent<HTMLElement>) => {
    if (isOutsideModal(event, ref.current)) {
      onClick(event);
    }
  };

  return ReactDOM.createPortal(
    <BackgroundAside onClick={handleOnClick}>
      <ModalContainer ref={ref}>
        <ModalTitleContainer>
          {title}
          <CloseButtonImg
            onClick={onClick}
            src={closeIcon}
            alt="close button"
            role="button"
          />
        </ModalTitleContainer>
        <ModalContentContainer>{children}</ModalContentContainer>
      </ModalContainer>
    </BackgroundAside>,
    document.getElementById("app") as HTMLElement,
  );
};

export default ModalDialog;
