import React from "react";

import { ReferenceFacility } from "../../types";
import ReferenceFacilityRow from "./ReferenceFacilityRow";

interface Props {
  referenceFacilities: ReferenceFacility[];
  onClick: (selectedId: ReferenceFacility["id"]) => void;
  selectedId: ReferenceFacility["id"] | null | undefined;
}

export const ReferenceFacilityList: React.FC<Props> = ({
  referenceFacilities,
  onClick,
  selectedId,
}) => {
  return (
    <>
      {referenceFacilities.map((refFacility) => (
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
