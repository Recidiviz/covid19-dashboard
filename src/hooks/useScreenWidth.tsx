// reports the screen width (including after resize)
import { useEffect, useState } from "react";

const useScreenWidth = (): number => {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  const updateWidth = () => {
    const newWidth = window.innerWidth;
    setScreenWidth(newWidth);
  };
  useEffect(() => {
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  });
  return screenWidth;
};

export default useScreenWidth;
