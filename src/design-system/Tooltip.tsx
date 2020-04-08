import React, { useState } from "react";
import { Manager, Popper, Reference } from "react-popper";

interface Props {
  content: string;
  children: JSX.Element;
}

const Tooltip: React.FC<Props> = (props) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <Manager>
      <Reference>
        {({ ref }) => (
          <span
            ref={ref}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            {props.children}
          </span>
        )}
      </Reference>
      {showTooltip && (
        <Popper placement="right">
          {({ ref, style, placement, arrowProps }) => (
            <div ref={ref} style={style} data-placement={placement}>
              {props.content}
              <div ref={arrowProps.ref} style={arrowProps.style} />
            </div>
          )}
        </Popper>
      )}
    </Manager>
  );
};

export default Tooltip;
