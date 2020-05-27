import { useCallback, useState } from "react";

// per https://medium.com/trabe/catching-asynchronous-errors-in-react-using-error-boundaries-5e8a5fd7b971
const useError = () => {
  const [, setError] = useState();
  return useCallback(
    (e) => {
      setError(() => {
        throw e;
      });
    },
    [setError],
  );
};

export default useError;
