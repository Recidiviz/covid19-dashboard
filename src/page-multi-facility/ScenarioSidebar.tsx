import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

import iconEditSrc from "../design-system/icons/ic_edit.svg";
import InputText from "../design-system/InputText";
import InputTextArea from "../design-system/InputTextArea";
import PromoBoxWithButton from "../design-system/PromoBoxWithButton";
import ToggleRow from "./ToggleRow";
import { Scenario } from "./types";

const ScenarioNameLabel = styled.label`
  align-items: baseline;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const IconEdit = styled.img`
  flex: 0 0 auto;
  height: 10px;
  margin-left: 10px;
  visibility: hidden;
  width: 10px;

  ${ScenarioNameLabel}:hover & {
    visibility: visible;
  }
`;

const ScenarioHeading = styled.h1`
  font-size: 1.875rem;
  line-height: 1.2;
`;

interface Props {
  numFacilities?: number | null;
  scenario?: Scenario | null;
  updateScenario: (scenario: Scenario) => void;
}

export function getEnabledPromoType(
  scenario?: Scenario | null,
  numFacilities?: number | null,
) {
  if (!scenario) return null;

  const { dailyReports, dataSharing, promoStatuses } = scenario;

  return !dailyReports && promoStatuses.dailyReports
    ? "dailyReports"
    : !dataSharing && promoStatuses.dataSharing
    ? "dataSharing"
    : numFacilities && numFacilities < 3 && promoStatuses.addFacilities
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
};

export function getPromoText(promoType: string | null) {
  if (!promoType) return null;
  return promoTexts[promoType];
}

const ScenarioSidebar: React.FC<Props> = (props) => {
  const { scenario, updateScenario, numFacilities } = props;
  const updatedAtDate = Number(scenario?.updatedAt.toDate());

  const handleScenarioChange = (scenarioChange: object) => {
    updateScenario(Object.assign({}, scenario, scenarioChange));
  };
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(scenario?.name);
  const [promoDismissed, setPromoDismissed] = useState(false);
  const [description, setDescription] = useState(scenario?.description);
  const promoType: string | null = getEnabledPromoType(scenario, numFacilities);

  useEffect(() => {
    updateScenario(Object.assign({}, scenario, { description }));
  }, [description]);

  useEffect(() => {
    updateScenario(Object.assign({}, scenario, { name }));
  }, [name]);

  const onEnterPress = (event: React.KeyboardEvent, onEnter: Function) => {
    if (event.key !== "Enter") return;

    onEnter();
  };

  return (
    <div className="flex flex-col w-1/4 mr-24">
      <div className="flex-1 flex flex-col pb-4">
        <ScenarioNameLabel>
          {!editingName ? (
            <ScenarioHeading onClick={() => setEditingName(true)}>
              {name}
            </ScenarioHeading>
          ) : (
            <InputText
              type="text"
              headerStyle={true}
              focus={true}
              valueEntered={name}
              onValueChange={(value) => setName(value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={(event) =>
                onEnterPress(event, () => setEditingName(false))
              }
            />
          )}
          <IconEdit alt="Scenario name" src={iconEditSrc} />
        </ScenarioNameLabel>
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
        </div>
      </div>
    </div>
  );
};

export default ScenarioSidebar;
