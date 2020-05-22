import { useCallback } from "react";

import { useToasts } from "../design-system/Toast";

const useRejectionToast = () => {
  const { addToast } = useToasts();

  return useCallback(
    async (p: Promise<any>) => {
      try {
        return await p;
      } catch (e) {
        addToast(e.message);
      }
    },
    [addToast],
  );
};

export default useRejectionToast;
