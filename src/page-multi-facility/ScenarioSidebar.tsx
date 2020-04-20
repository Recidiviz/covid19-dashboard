import { format } from "date-fns";
import React, { useEffect, useState } from "react";

import InputTextArea from "../design-system/InputTextArea";
import PromoBoxWithButton from "../design-system/PromoBoxWithButton";
import ToggleRow from "./ToggleRow";
import { Scenario } from "./types";

interface Props {
  numFacilities?: number | null;
  scenario?: Scenario | null;
  updateScenario: (scenario: Scenario) => void;
}

const promoText = (
  scenario?: Scenario | null,
  numFacilities?: number | null,
) => {
  if (!scenario?.dailyReports) {
    return "Turn on 'Daily Reports' to receive briefings based on the data in this scenario, prepared by Recidiviz and CSG.";
  } else if (!scenario?.dataSharing) {
    return "Turn on 'Data Sharing' to provide your baseline data to public researchers, to help improve models of disease spread in prisons in the future.";
  } else if (numFacilities && numFacilities < 3) {
    return "Add additional facilities to see the impact across your entire system.";
  } else {
    return null;
  }
};

const ScenarioSidebar: React.FC<Props> = (props) => {
  const { scenario, updateScenario, numFacilities } = props;
  const updatedAtDate = Number(scenario?.updatedAt.toDate());

  const handleScenarioChange = (scenarioChange: object) => {
    updateScenario(Object.assign({}, scenario, scenarioChange));
  };

  const [description, setDescription] = useState(scenario?.description);

  useEffect(() => {
    updateScenario(Object.assign({}, scenario, { description }));
  }, [description]);
  console.log({ scenario });
  return (
    <div className="flex flex-col w-1/4 mr-24">
      <div className="flex-1 flex flex-col pb-4">
        <h1 className="text-3xl leading-none">{scenario?.name}</h1>
        <div className="mt-5 mb-5 border-b border-gray-300" />
        <div className="mb-12">
          <InputTextArea
            label="Description"
            value={description}
            placeholder=""
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
        <div>
          <p className="text-xs text-gray-500">
            Last Update:{" "}
            {updatedAtDate && format(updatedAtDate, "MMMM d, yyyy")}
          </p>
        </div>
        <div className="mt-5 mb-5 border-b border-gray-300" />
        <div>
          <ToggleRow
            onToggle={() =>
              handleScenarioChange({ dailyReports: !scenario?.dailyReports })
            }
            toggled={scenario?.dailyReports}
            label="Daily Reports"
            labelHelp="If enabled, your baseline scenario will be shared with Recidiviz and CSG. This data will only be used to provide you with daily reports."
          />
          <ToggleRow
            onToggle={() =>
              handleScenarioChange({ dataSharing: !scenario?.dataSharing })
            }
            toggled={scenario?.dataSharing}
            label="Data Sharing"
            labelHelp="If enabled, your baseline scenario will be made available to Recidiviz and the research community to improve the model and the state of research on the spread of disease in facilities. Any public research will anonymize state and facility names."
          />
          <PromoBoxWithButton
            enabled={scenario?.baseline && scenario?.showPromo}
            onDismiss={() => handleScenarioChange({ showPromo: false })}
            text={promoText(scenario, numFacilities)}
          />
        </div>
      </div>
    </div>
  );
};

export default ScenarioSidebar;
