// Need to patch some types in react-type-notifications, but you basically have to override the whole thing to get it to work.

import { ComponentType, ReactNode } from "react";

declare module "react-toast-notifications" {
  export type AppearanceTypes = "error" | "info" | "success" | "warning";

  export type Placement =
    | "bottom-left"
    | "bottom-center"
    | "bottom-right"
    | "top-left"
    | "top-center"
    | "top-right";

  export type TransitionState = "entering" | "entered" | "exiting" | "exited";

  // Patch: adding customId  
  export interface ToastProps {
    customId?: string;
    appearance: AppearanceTypes;
    autoDismiss: boolean | number; // inherited from ToastProvider
    autoDismissTimeout: number; // inherited from ToastProvider
    children: ReactNode;
    isRunning: boolean;
    onDismiss: (id?: string) => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    placement: Placement;
    transitionDuration: number; // inherited from ToastProvider
    transitionState: TransitionState; // inherited from ToastProvider
  }

  export interface ToastConsumerContext {
    add: AddToast;
    remove: RemoveToast;
    toasts: Array<{
      content: ReactNode;
      id: string;
      appearance: AppearanceTypes;
    }>;
  }

  export interface ToastConsumerProps {
    children: (context: ToastConsumerContext) => ReactNode;
  }

  export interface ToastContainerProps {
    children: ReactNode;
    hasToasts: boolean;
    placement: Placement;
  }

  // Patch: adding autoDismissTimeout, id, customId
  export interface ToastProviderProps {
    autoDismiss?: boolean | number;
    autoDismissTimeout?: number;
    children: ReactNode;
    components?: {
      ToastContainer?: ComponentType<ToastContainerProps>;
      Toast?: ComponentType<ToastProps>;
    };
    placement?: Placement;
    transitionDuration?: number;
  }

  export interface Options {
    appearance?: AppearanceTypes;
    autoDismiss?: boolean;
    autoDismissTimeout?: number;
    id?: string;
    customId?: string;
    onDismiss?: (id: string) => void;
  }

  export interface UpdateOptions extends Options {
    content?: string;
  }

  export type AddToast = (
    content: ReactNode,
    options?: Options,
    callback?: (id: string) => void,
  ) => void;

  export type RemoveToast = (id: string, callback?: () => void) => void;

  export type RemoveAllToasts = () => void;

  export type UpdateToast = (
    id: string,
    options?: Options,
    callback?: (id: string) => void,
  ) => void;
  export const DefaultToastContainer: ComponentType<ToastContainerProps>;
  export const DefaultToast: ComponentType<ToastProps>;
  export const ToastConsumer: ComponentType<ToastConsumerProps>;
  export const ToastProvider: ComponentType<ToastProviderProps>;
  export function withToastManager(...args: any[]): any;
  export function useToasts(): {
    addToast: AddToast;
    removeToast: RemoveToast;
    removeAllToasts: RemoveAllToasts;
    toastStack: Array<{
      content: ReactNode;
      id: string;
      appearance: AppearanceTypes;
    }>;
    updateToast: UpdateToast;
  };
}
