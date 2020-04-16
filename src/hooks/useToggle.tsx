import { useState } from "react";

function useToggle() {
  const [state, setState] = useState(true) as any;

  const toggle = () => {
    setState(!state);
  };

  return [state, toggle];
}

export default useToggle;
