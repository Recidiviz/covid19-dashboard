import React from "react";

import { referenceFacilitiesProp } from "../../../database";
import { useFacilities } from "../../../facilities-context";
import useScenario from "../../../scenario-context/useScenario";
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
  const [scenarioState] = useScenario();
  const mappedReferenceFacilities =
    scenarioState.data?.[referenceFacilitiesProp] || {};

  const {
    state: { referenceFacilities },
  } = useFacilities();

  const facilities = Object.values(referenceFacilities).filter(
    (refFacility) => {
      return !Object.values(mappedReferenceFacilities).includes(refFacility.id);
    },
  );

  return (
    <>
      {facilities.map((refFacility) => (
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
