import { useState } from "react";

import InputText from "../design-system/InputText";
import InputTextNumeric from "../design-system/InputTextNumeric";
import Description from "./Description";
import { FormGrid, FormGridCell, FormGridRow } from "./FormGrid";

const MitigationInformation: React.FC = () => {
  // TODO: temporary state for development
  const [date, updateDate] = useState<string>();
  const [released, updateReleased] = useState<number>();
  return (
    <>
      <Description>
        Enter planned reductions in the in-facility population (e.g., early
        releases to supervision).
      </Description>
      <FormGrid>
        <FormGridRow>
          <FormGridCell>
            <InputText
              labelAbove="Release date"
              labelHelp={`
                  Enter the date of any planned reductions in the in-facility
                  population below (e.g., early releases to supervision).
                `}
              type="text"
              valueEntered={date}
              onValueChange={updateDate}
            />
          </FormGridCell>
          <FormGridCell>
            <InputTextNumeric
              labelAbove="Number released"
              labelHelp="Enter the number of incarcerated you plan to release."
              type="number"
              valueEntered={released}
              onValueChange={updateReleased}
            />
          </FormGridCell>
        </FormGridRow>
      </FormGrid>
    </>
  );
};

export default MitigationInformation;
