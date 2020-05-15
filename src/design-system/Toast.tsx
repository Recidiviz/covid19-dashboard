import React from "react";
import { ToastProps, useToasts } from "react-toast-notifications";
import styled from "styled-components";

import Colors from "./Colors";
import closeIcon from "./icons/ic_close_slate.svg";

const ToastDiv = styled.div`
  background: ${Colors.paleTeal};
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 13px 15px 13px 15px;
  align-items: center;
`;

const ToastContent = styled.div`
  color: ${Colors.slate};
  font-size: 13px;
  font-weight: normal;
  font-family: Poppins;
  line-height: 16px;
`;

const ToastDismiss = styled.img`
  padding-left: 30px;
  height: 11px;
`;

const Toast: React.FC<ToastProps> = (props) => {
  const { removeToast } = useToasts();
  return (
    <ToastDiv>
      <ToastContent>{props.children}</ToastContent>
      <ToastDismiss
        onClick={() => (props.customId ? removeToast(props.customId) : null)}
        src={closeIcon}
        alt="close button"
        role="button"
      />
    </ToastDiv>
  );
};

export default Toast;
