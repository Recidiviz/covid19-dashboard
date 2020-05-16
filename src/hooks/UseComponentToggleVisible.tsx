import { RefObject, useEffect, useRef, useState } from "react";

interface UseComponentVisibleOutput {
  ref: RefObject<HTMLDivElement> | null;
  isComponentVisible: boolean;
  setIsComponentVisible: Function;
}

const UseComponentToggleVisible = (
  initialIsVisible: boolean,
): UseComponentVisibleOutput => {
  const [isComponentVisible, setIsComponentVisible] = useState(
    initialIsVisible,
  );
  const ref = useRef<HTMLDivElement>(null);

  const handleClick = (event: Event) => {
    if (ref.current && !ref.current.contains(event.target as HTMLDivElement)) {
      setIsComponentVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  });

  return { ref, isComponentVisible, setIsComponentVisible };
};

export default UseComponentToggleVisible;
