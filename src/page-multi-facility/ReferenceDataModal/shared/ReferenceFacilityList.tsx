import React from "react";

import { useFacilities } from "../../../facilities-context";
import { ReferenceFacility } from "../../types";
import ReferenceFacilityRow from "./ReferenceFacilityRow";

interface Props {
  onClick: (selectedId: ReferenceFacility["id"]) => void;
  selectedId: ReferenceFacility["id"] | null | undefined;
}

export const ReferenceFacilityList: React.FC<Props> = ({
  onClick,
  selectedId,
}) => {
  const {
    state: { referenceFacilities },
  } = useFacilities();
  return (
    <>
      {Object.values(referenceFacilities).map((refFacility) => (
        <ReferenceFacilityRow
          key={refFacility.id}
          selected={selectedId === refFacility.id}
          referenceFacility={refFacility}
          onClick={() => onClick(refFacility.id)}
        />
      ))}
    </>
  );
};
