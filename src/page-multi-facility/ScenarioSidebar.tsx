import { format } from "date-fns";
import { navigate } from "gatsby";
import React, { useState } from "react";
import styled from "styled-components";

import { saveScenario } from "../database";
import Colors from "../design-system/Colors";
import InputButton from "../design-system/InputButton";
import InputDescription from "../design-system/InputDescription";
import InputNameWithIcon from "../design-system/InputNameWithIcon";
import PromoBoxWithButton from "../design-system/PromoBoxWithButton";
import { Spacer } from "../design-system/Spacer";
import { useFlag } from "../feature-flags";
import useScenario from "../scenario-context/useScenario";
import ToggleRow from "./ToggleRow";
import { Scenario } from "./types";

const HorizontalRule = styled.hr`
  border-color: ${Colors.opacityGray};
`;

interface Props {
  numFacilities?: number | null;
}

export function getEnabledPromoType(
  scenario?: Scenario | null,
  numFacilities?: number | null,
) {
  if (!scenario) return null;

  const { dailyReports, dataSharing, promoStatuses } = scenario;

  return promoStatuses.rtChart
    ? "rtChart"
    : !dailyReports && promoStatuses?.dailyReports
    ? "dailyReports"
    : !dataSharing && promoStatuses?.dataSharing
    ? "dataSharing"
    : numFacilities && numFacilities < 3 && promoStatuses?.addFacilities
    ? "addFacilities"
    : null;
}

const promoTexts: { [promoType: string]: string } = {
  dailyReports:
    "Turn on 'Daily Reports' to receive briefings based on the data in this scenario, prepared by Recidiviz and CSG.",
  dataSharing:
    "Turn on 'Data Sharing' to provide your baseline data to public researchers, to help improve models of disease spread in prisons in the future.",
  addFacilities:
    "Add additional facilities to see the impact across your entire system.",
  rtChart: `New! View the chart of Rt (the rate of spread over time) for any
    facility by selecting it. This is based on the number of cases over time
    for that facility. To get an accurate Rt, enter case counts for previous
    days by clicking the number of cases on the right (in red) to update case
    numbers.)`,
};

export function getPromoText(promoType: string | null) {
  if (!promoType) return null;
  return promoTexts[promoType];
}

const ScenarioSidebar: React.FC<Props> = (props) => {
  const [scenarioState, dispatchScenarioUpdate] = useScenario();
  const scenario = scenarioState.data;
  const { numFacilities } = props;
  const updatedAtDate = Number(scenario?.updatedAt);
  const showImpactButton = useFlag(["showImpactButton"]);

  const handleScenarioChange = (scenarioChange: any) => {
    const changes = Object.assign({}, scenario, scenarioChange);
    saveScenario(changes).then((_) => {
      dispatchScenarioUpdate(changes);
    });
  };

  const handleTextInputChange = (textInputChanges: {
    description?: string;
    name?: string;
  }) => {
    // Prevent the input fields from unintentionally updating with a empty
    // value when being edited.
    if (textInputChanges.name || textInputChanges.description) {
      handleScenarioChange(textInputChanges);
    }
  };

  const [name, setName] = useState(scenario?.name);
  const [promoDismissed, setPromoDismissed] = useState(false);
  const [description, setDescription] = useState(scenario?.description);
  const promoType: string | null = getEnabledPromoType(scenario, numFacilities);

  return (
    <div className="flex flex-col w-1/4 mr-24">
      <div className="flex-1 flex flex-col pb-4">
        <InputNameWithIcon
          name={name}
          setName={setName}
          placeholderValue={scenario?.name}
          placeholderText="Scenario name is required"
          maxLengthValue={124}
          requiredFlag={true}
          persistChanges={handleTextInputChange}
          showIcon
        />
        <Spacer y={20} />
        <InputDescription
          description={description}
          setDescription={setDescription}
          placeholderValue={scenario?.description}
          placeholderText="Scenario description is required"
          maxLengthValue={500}
          requiredFlag={true}
          persistChanges={handleTextInputChange}
        />
        <Spacer y={20} />
        <div>
          <p className="text-xs text-gray-500">
            Last Update:{" "}
            {updatedAtDate && format(updatedAtDate, "MMMM d, yyyy")}
          </p>
        </div>
        <div>
          <Spacer y={20} />
          <HorizontalRule />
          <ToggleRow
            onToggle={() =>
              handleScenarioChange({ dailyReports: !scenario?.dailyReports })
            }
            toggled={scenario?.dailyReports}
            label="Subscribe to daily reports"
            labelHelp="If enabled, your baseline scenario will be shared with Recidiviz and CSG. This data will only be used to provide you with daily reports."
          />
          <HorizontalRule />
          <ToggleRow
            onToggle={() =>
              handleScenarioChange({ dataSharing: !scenario?.dataSharing })
            }
            toggled={scenario?.dataSharing}
            label="Share data to improve the model"
            labelHelp="If enabled, your baseline scenario will be made available to Recidiviz and the research community to improve the model and the state of research on the spread of disease in facilities. Any public research will anonymize state and facility names."
          />
          <HorizontalRule />
          <PromoBoxWithButton
            enabled={!!scenario?.baseline && !promoDismissed}
            text={getPromoText(promoType) || null}
            onDismiss={() => {
              if (scenario && promoType) {
                setPromoDismissed(true);
                handleScenarioChange({
                  promoStatuses: {
                    ...scenario.promoStatuses,
                    [promoType]: false,
                  },
                });
              }
            }}
          />

          {showImpactButton && (
            <InputButton
              styles={{
                background: Colors.green,
                borderRadius: "4px",
                fontSize: "14px",
                fontFamily: "PingFang SC",
                width: "100%",
              }}
              label="Generate Impact Report"
              onClick={() => navigate("/impact")}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ScenarioSidebar;
