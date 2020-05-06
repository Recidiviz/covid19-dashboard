import React from "react";
import styled from "styled-components";

import Colors from "./Colors";
import closeIcon from "./icons/ic_close.svg";

export interface TitleProps {
  title?: string;
  closeModal?: (
    e: React.MouseEvent<HTMLElement>,
  ) => void | null | Promise<void>;
}

const CloseButtonImg = styled.img`
  display: inline-block;
  height: 20px;
  padding: 0 1em;
  float: right;
`;

const ModalTitleContainer = styled.div`
  border-bottom: 0.5px solid ${Colors.darkGray};
  display: inline-block;
  font-size: 16px;
  font-family: "Poppins", sans-serif;
  padding-bottom: 20px;
  width: 100%;
`;

const ModalTitle: React.FC<TitleProps> = (props) => {
  const { title, closeModal } = props;
  return (
    <ModalTitleContainer>
      {title}
      {closeModal && (
        <CloseButtonImg
          onClick={closeModal}
          src={closeIcon}
          alt="close button"
          role="button"
        />
      )}
    </ModalTitleContainer>
  );
};

export default ModalTitle;
