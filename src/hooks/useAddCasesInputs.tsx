import { startOfDay } from "date-fns";
import { pick } from "lodash";
import { useCallback, useState } from "react";

import { saveFacility } from "../database";
import {
  ModelInputsPopulationBrackets,
  populationBracketKeys,
} from "../impact-dashboard/EpidemicModelContext";
import useModel from "../impact-dashboard/useModel";
import { Facility } from "../page-multi-facility/types";
import useFacilityModelVersions from "./useFacilityModelVersions";

const useAddCasesInputs = (
  facility: Facility,
  onSave: (f: Facility) => void,
) => {
  // the current state of the facility is the default when we need to reset
  const defaultInputs = pick(facility.modelInputs, populationBracketKeys);
  const defaultObservationDate = facility.modelInputs.observedAt;

  const [inputs, setInputs] = useState<ModelInputsPopulationBrackets>(
    defaultInputs,
  );
  const [observationDate, setObservationDate] = useState(
    defaultObservationDate,
  );
  const [facilityModelVersions, updateModelVersions] = useFacilityModelVersions(
    facility,
  );

  const updateInputs = (update: ModelInputsPopulationBrackets) => {
    setInputs({ ...inputs, ...update });
  };

  const resetModalData = () => {
    setInputs(defaultInputs);
    setObservationDate(defaultObservationDate);
  };

  const [, updateModel] = useModel();

  const findMatchingDay = useCallback(
    ({ date }: { date: Date }) =>
      facilityModelVersions?.find(
        ({ observedAt }) => date.toDateString() === observedAt.toDateString(),
      ),
    [facilityModelVersions],
  );

  const onDateChange = (date: Date | undefined) => {
    if (date) {
      setObservationDate(date);
      const inputsForDate = findMatchingDay({
        date,
      });
      if (inputsForDate) {
        setInputs(pick(inputsForDate, populationBracketKeys));
      } else {
        setInputs({ ...defaultInputs });
      }
    }
  };

  const saveCases = async () => {
    const newInputs = {
      ...facility.modelInputs,
      ...inputs,
      observedAt: observationDate,
    };
    // Update the local state iff
    // The observedAt date in the modal is more recent than the observedAt date in the current modelInputs.
    // This needs to happen so that facility data will show the most updated data w/o requiring a hard reload.
    const latestFacilityData = { ...facility };
    if (
      defaultObservationDate &&
      observationDate &&
      startOfDay(observationDate) >= startOfDay(defaultObservationDate)
    ) {
      // sending the full input object into the model context may trigger side effects
      // such as a full reset, so just send the inputs that are editable
      // in this dialog
      updateModel({ ...inputs, observedAt: observationDate });
      // new inputs should be the new "current" model inputs
      latestFacilityData.modelInputs = newInputs;
    }
    // Save to DB with model changes;
    // if they are not most recent the save function will handle it,
    // unlike the local state handlers
    await saveFacility(facility.scenarioId, {
      id: facility.id,
      modelInputs: newInputs,
    });

    // After the DB is updated, then process the onSave callback
    onSave(latestFacilityData);
    updateModelVersions();
  };

  return {
    inputs,
    observationDate,
    onDateChange,
    facilityModelVersions,
    updateInputs,
    resetModalData,
    saveCases,
  };
};

export default useAddCasesInputs;
