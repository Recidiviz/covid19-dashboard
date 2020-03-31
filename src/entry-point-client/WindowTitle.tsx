import { useEffect } from "react";

interface WindowTitleProps {
  children: string;
}

const WindowTitle: React.FC<WindowTitleProps> = (props) => {
  useEffect(() => {
    if (window.document && window.document.title) {
      document.title = props.children;
    }
  }, [props.children]);

  return null;
};

export default WindowTitle;
