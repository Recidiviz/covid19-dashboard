import { startOfDay } from "date-fns";
import { pick } from "lodash";
import { useEffect, useState } from "react";

import { useToasts } from "../design-system/Toast";
import { useFacilities } from "../facilities-context";
import {
  ModelInputsPopulationBrackets,
  populationBracketKeys,
} from "../impact-dashboard/EpidemicModelContext";
import useModel from "../impact-dashboard/useModel";
import { Facility, ModelInputs } from "../page-multi-facility/types";
import useFacilityModelVersions from "./useFacilityModelVersions";
import useRejectionToast from "./useRejectionToast";

export const getBracketData = (modelInputs: ModelInputs) => {
  return pick(modelInputs, populationBracketKeys);
};

function findMostRecentDate(
  defaultDate: Date,
  facilityModelVersions: ModelInputs[] | undefined,
) {
  let mostRecentDate = defaultDate;
  if (facilityModelVersions) {
    console.log("facilittyModelVersions", facilityModelVersions);
    let facilityDatesObservedAt = facilityModelVersions.map(
      (observedAt) => observedAt.observedAt,
    );
    console.log(
      "default Date",
      defaultDate,
      "dates observed",
      facilityDatesObservedAt,
    );
    if (facilityDatesObservedAt.length > 0) {
      let earlierDates = facilityDatesObservedAt.filter(function (d) {
        console.log("d", d);
        // TODO: why isn't june 17 earlier than june 18?
        // console.log(d.toDateString(), defaultDate.toDateString());
        return d.toDateString() <= defaultDate.toDateString();
      });
      console.log("earlier dates", earlierDates);
      if (earlierDates.length > 0)
        mostRecentDate = earlierDates[earlierDates.length - 1];
    }
  }
  console.log(mostRecentDate);
  return mostRecentDate;
}

const findMatchingDay = ({
  date,
  facilityModelVersions,
}: {
  date: Date;
  facilityModelVersions: ModelInputs[] | undefined;
}) =>
  facilityModelVersions?.find(
    ({ observedAt }) => date.toDateString() === observedAt.toDateString(),
  );

const useAddCasesInputs = (
  facility: Facility,
  onSave: (f: Facility) => void,
  observedAt?: Date | undefined,
) => {
  const { actions } = useFacilities();
  const { addToast } = useToasts();

  // use date from args but provide a fallback when it's missing
  const defaultObservationDate = facility.modelInputs.observedAt;
  const [observationDate, setObservationDate] = useState(
    observedAt || defaultObservationDate,
  );
  useEffect(() => {
    setObservationDate(observedAt || defaultObservationDate);
  }, [defaultObservationDate, observedAt]);

  const [facilityModelVersions, updateModelVersions] = useFacilityModelVersions(
    facility,
  );

  // use the current state of the facility as default values
  const defaultInputs = facility.modelInputs;

  const [observedAtVersion, setObservedAtVersion] = useState<
    ModelInputs | undefined
  >();
  // whenever observation date changes we should look for a new model version
  useEffect(() => {
    const newDate = findMostRecentDate(observationDate, facilityModelVersions);
    const newObservedAtVersion = findMatchingDay({
      date: newDate,
      facilityModelVersions,
    });

    // setObservedAtVersion(newObservedAtVersion);

    if (newObservedAtVersion) {
      setObservedAtVersion(newObservedAtVersion);
      console.log(newObservedAtVersion);
    } else {
      setObservedAtVersion(defaultInputs);
    }
  }, [facilityModelVersions, defaultInputs, observationDate]);

  const [inputs, setInputs] = useState<ModelInputsPopulationBrackets>(
    getBracketData(observedAtVersion || defaultInputs),
  );

  // when we find an observedAtVersion, that takes precedence over the default
  useEffect(() => {
    setInputs(getBracketData(observedAtVersion || defaultInputs));
  }, [defaultInputs, observedAtVersion]);

  const updateInputs = (update: ModelInputsPopulationBrackets) => {
    setInputs({ ...inputs, ...update });
  };

  const resetModalData = () => {
    // any state that is date-dependent should be watching this value,
    // so we don't have to update all of it imperatively
    setObservationDate(defaultObservationDate);
  };

  const [, updateModel] = useModel();

  const rejectionToast = useRejectionToast();

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

    // Save to DB with model changes;
    // if they are not most recent the save function will handle it,
    // unlike the local state handlers
    await rejectionToast(
      actions
        .createOrUpdateFacility(facility.scenarioId, {
          id: facility.id,
          modelInputs: newInputs,
        })
        .then(() => {
          // don't update the UI unless save succeeds; there may have been a permission rejection
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

          onSave(latestFacilityData);
          updateModelVersions();
          addToast("Data successfully saved!");
        }),
    );
  };

  return {
    inputs,
    observationDate,
    facilityModelVersions,
    updateInputs,
    resetModalData,
    saveCases,
  };
};

export default useAddCasesInputs;
