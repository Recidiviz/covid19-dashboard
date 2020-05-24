import { startOfDay } from "date-fns";
import { pick } from "lodash";
import { useCallback, useEffect, useState } from "react";

import { useToasts } from "../components/design-system/Toast";
import {
  ModelInputsPopulationBrackets,
  populationBracketKeys,
} from "../components/impact-dashboard/EpidemicModelContext";
import useModel from "../components/impact-dashboard/useModel";
import { saveFacility } from "../database";
import { Facility, ModelInputs } from "../page-multi-facility/types";
import useFacilityModelVersions from "./useFacilityModelVersions";

export const getModelInputs = (modelInputs: ModelInputs) => {
  return pick(modelInputs, populationBracketKeys);
};

const useAddCasesInputs = (
  facility: Facility,
  onSave: (f: Facility) => void,
  observedAt?: Date | undefined,
) => {
  const { addToast } = useToasts();
  const [facilityModelVersions, updateModelVersions] = useFacilityModelVersions(
    facility,
  );
  const [observedAtVersion, setObservedAtVersion] = useState<
    ModelInputs | undefined
  >();
  // the current state of the facility is the default when we need to reset
  // If observedAt is provided and a version exists then use the version's inputs
  const defaultInputs = getModelInputs(
    observedAtVersion || facility.modelInputs,
  );
  // If observedAt is provided then set it as the default date
  const defaultObservationDate = observedAt || facility.modelInputs.observedAt;

  const [inputs, setInputs] = useState<ModelInputsPopulationBrackets>(
    defaultInputs,
  );

  const [observationDate, setObservationDate] = useState(
    defaultObservationDate,
  );

  const findMatchingDay = useCallback(
    ({ date }: { date: Date }) =>
      facilityModelVersions?.find(
        ({ observedAt }) => date.toDateString() === observedAt.toDateString(),
      ),
    [facilityModelVersions],
  );

  useEffect(() => {
    if (observedAt) {
      const observedAtVersion = findMatchingDay({ date: observedAt });
      setObservationDate(observedAt);

      if (observedAtVersion) {
        setInputs(getModelInputs(observedAtVersion));
        setObservedAtVersion(observedAtVersion);
      } else {
        setInputs({});
        setObservedAtVersion(undefined);
      }
    }
  }, [observedAt, findMatchingDay]);

  const updateInputs = (update: ModelInputsPopulationBrackets) => {
    setInputs({ ...inputs, ...update });
  };

  const resetModalData = () => {
    setInputs(defaultInputs);
    setObservationDate(defaultObservationDate);
  };

  const [, updateModel] = useModel();

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
    addToast("Data successfully saved!");
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
