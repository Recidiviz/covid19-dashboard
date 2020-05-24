import React from "react";
import { useRef, useState } from "react";
import useVisibility from "react-use-visibility";

import Loading from "../components/design-system/Loading";

interface Props {
  children: React.ReactElement;
}

/**
 * Renders a FacilityRow if the component is (or has been) visible. Otherwise,
 * renders a loading indicator.
 *
 * FacilityRows load slowly and sometimes block the main JS thread, especially
 * on IE11. Using this component instead of using FacilityRows directly makes
 * sure that FacilityRows that aren't in the viewport aren't slowing down the
 * page.
 *
 * More details: https://github.com/Recidiviz/covid19-dashboard/pull/460
 */
const FacilityRowPlaceholder: React.FC<Props> = (props) => {
  const shouldShowRef = useRef<boolean>(false);
  const [el, setEl] = useState<HTMLSpanElement | null>(null);

  const visibility = useVisibility(el);

  if (visibility && !shouldShowRef.current) {
    shouldShowRef.current = true;
  }

  if (shouldShowRef.current) {
    return props.children;
  } else {
    return (
      <div style={{ height: "177px" }}>
        <span ref={(newEl) => !el && newEl && setEl(newEl)} />
        <div style={{ opacity: 0.5 }}>
          <Loading />
        </div>
      </div>
    );
  }
};

export default FacilityRowPlaceholder;
