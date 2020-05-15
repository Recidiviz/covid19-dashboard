// Need to patch some types in react-type-notifications.

import {
  Options as OptionsOrig,
  ToastProps as ToastPropsOrig,
} from "react-toast-notifications";

declare module "react-toast-notifications" {
  export interface ToastProps extends ToastPropsOrig {
    customId?: string;
  }

  export interface Options extends OptionsOrig {
    autoDismissTimeout?: number;
    id?: string;
    customId?: string;
  }
}
