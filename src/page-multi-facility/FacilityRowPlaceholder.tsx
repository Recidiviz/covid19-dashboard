import React from "react";
import { useRef, useState } from "react";
import useVisibility from "react-use-visibility";

import Loading from "../design-system/Loading";
import useFetchRtDataForFacility from "../hooks/useFetchRtDataForFacility";
import { Facility } from "./types";

interface Props {
  facility: Facility;
  children: React.ReactElement;
}

const FacilityRowPlaceholder: React.FC<Props> = (props) => {
  const shouldShowRef = useRef<boolean>(false);
  const [el, setEl] = useState<HTMLSpanElement | null>(null);
  const fetchRtDataForFacility = useFetchRtDataForFacility();

  const visibility = useVisibility(el);

  if (visibility && !shouldShowRef.current) {
    shouldShowRef.current = true;
    fetchRtDataForFacility(props.facility);
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
