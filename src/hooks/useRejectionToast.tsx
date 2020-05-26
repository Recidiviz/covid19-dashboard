import { useCallback } from "react";

import { useToasts } from "../design-system/Toast";

/**
 * Returns a memoized callback that can be used anywhere in the consuming
 * component to handle Promise rejection by displaying its error message in
 * a Toast. The function takes a Promise that has already started, and it
 * returns a new Promise that should always resolve (meaning you shouldn't
 * chain anything on it that is conditional on the underlying Promise
 * resolving; those chains should be part of the Promise that is initially
 * passed to the callback).
 */
const useRejectionToast = () => {
  const { addToast } = useToasts();

  return useCallback(
    async (p: Promise<any>) => {
      try {
        return await p;
      } catch (e) {
        addToast(e.message, { appearance: "error" });
      }
    },
    [addToast],
  );
};

export default useRejectionToast;
