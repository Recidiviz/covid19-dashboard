import React, { useState } from "react";
import { Manager, Popper, Reference } from "react-popper";
import styled from "styled-components";

import Colors from "./Colors";

const ArrowMargin = "-4px";
const ArrowWidth = "8px";
const ArrowHalfWidth = "4px";
const ArrowLength = "4px";

const TooltipReferenceDiv = styled.div`
  display: inline-block;
  cursor: pointer;
  align-self: center;
`;

// Mostly taken from:
// https://github.com/popperjs/react-popper/blob/8994933/demo/styles.js#L100
const TooltipContentsDiv = styled.div`
  background: ${Colors.forest};
  color: white;

  border-radius: 5px;
  min-width: 20px;
  min-height: 20px;
  max-width: 400px;
  padding: 5px;
  margin-left: 5px;
  z-index: 100;
`;

const TooltipArrowDiv = styled.div`
  &[data-placement*="bottom"] {
    top: 0;
    left: 0;
    margin-top: ${ArrowMargin};
    width: ${ArrowWidth};
    height: ${ArrowLength};
    &::before {
      border-width: 0 ${ArrowHalfWidth} ${ArrowLength} ${ArrowHalfWidth};
      border-color: transparent transparent ${Colors.forest} transparent;
    }
  }
  &[data-placement*="top"] {
    bottom: 0;
    left: 0;
    margin-bottom: ${ArrowMargin};
    width: ${ArrowWidth};
    height: ${ArrowLength};
    &::before {
      border-width: ${ArrowLength} ${ArrowHalfWidth} 0 ${ArrowHalfWidth};
      border-color: ${Colors.forest} transparent transparent transparent;
    }
  }
  &[data-placement*="right"] {
    left: 0;
    margin-left: ${ArrowMargin};
    height: ${ArrowWidth};
    width: ${ArrowLength};
    &::before {
      border-width: ${ArrowHalfWidth} ${ArrowLength} ${ArrowHalfWidth} 0;
      border-color: transparent ${Colors.forest} transparent transparent;
    }
  }
  &[data-placement*="left"] {
    right: 0;
    margin-right: ${ArrowMargin};
    height: ${ArrowWidth};
    width: ${ArrowLength};
    &::before {
      border-width: ${ArrowHalfWidth} 0 ${ArrowHalfWidth} ${ArrowLength};
      border-color: transparent transparent transparent ${Colors.forest};
    }
  }
  &::before {
    content: "";
    margin: auto;
    display: block;
    width: 0;
    height: 0;
    border-style: solid;
  }
`;

interface Props {
  content: React.ReactNode;
  children: React.ReactNode;
}

const Tooltip: React.FC<Props> = (props) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <Manager>
      <Reference>
        {({ ref }) => (
          <TooltipReferenceDiv
            ref={ref}
            onClick={() => !showTooltip && setShowTooltip(true)}
            onMouseOver={() => !showTooltip && setShowTooltip(true)}
            onMouseLeave={() => showTooltip && setShowTooltip(false)}
          >
            {props.children}
          </TooltipReferenceDiv>
        )}
      </Reference>
      {showTooltip && (
        <Popper placement="right">
          {({ ref, style, placement, arrowProps }) => (
            <TooltipContentsDiv
              ref={ref}
              style={style}
              data-placement={placement}
            >
              {props.content}
              <TooltipArrowDiv
                ref={arrowProps.ref}
                style={arrowProps.style}
                data-placement={placement}
              />
            </TooltipContentsDiv>
          )}
        </Popper>
      )}
    </Manager>
  );
};

export default Tooltip;
