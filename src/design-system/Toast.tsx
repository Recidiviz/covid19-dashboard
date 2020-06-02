import React from "react";
import {
  AppearanceTypes,
  Options,
  ToastProps,
  useToasts as useToastsOrig,
} from "react-toast-notifications";
import styled from "styled-components";

import Colors from "./Colors";
import closeIcon from "./icons/ic_close_slate.svg";

const ToastDiv = styled.div<{ appearance: AppearanceTypes }>(
  ({ appearance }) => {
    const backgroundColor =
      appearance == "success"
        ? Colors.paleTeal
        : appearance == "error"
        ? Colors.red
        : Colors.gray;
    return `
  background: ${backgroundColor};
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 13px 15px 13px 15px;
  align-items: center;
  max-width: 400px;
`;
  },
);

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

export const useToasts = () => {
  const { addToast, ...others } = useToastsOrig();
  const addToastWrapper = (...args: Parameters<typeof addToast>) => {
    const [content, options, callback] = args;
    // Custom ID to identify the toast to support dismiss
    const utcTimeString = new Date().getTime().toString();
    const newOptions: Options = {
      autoDismiss: true,
      autoDismissTimeout: 10000,
      appearance: "success",
      ...options,
      id: utcTimeString,
      customId: utcTimeString,
    };
    return addToast(content, newOptions, callback);
  };
  return { addToast: addToastWrapper, ...others };
};

const Toast: React.FC<ToastProps> = ({ appearance, children, customId }) => {
  const { removeToast } = useToasts();
  return (
    <ToastDiv appearance={appearance}>
      <ToastContent>{children}</ToastContent>
      <ToastDismiss
        onClick={() => (customId ? removeToast(customId) : null)}
        src={closeIcon}
        alt="close button"
        role="button"
      />
    </ToastDiv>
  );
};

export default Toast;
