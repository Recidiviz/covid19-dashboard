import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import iconEditSrc from "../design-system/icons/ic_edit.svg";
import iconFolderSrc from "../design-system/icons/ic_folder.svg";
import InputText from "../design-system/InputText";
import InputDescription from "../design-system/InputDescription";
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

const IconFolder = styled.img`
  display: inline;
  width: 12px;
  height: 12px;
  margin-right: 12px;
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
  color: ${Colors.forest};
  font-size: 24px;
  line-height: 1.2;
`;

interface Props {
  scenario?: Scenario | null;
  updateScenario: (scenario: Scenario) => void;
}

const ScenarioSidebar: React.FC<Props> = (props) => {
  const { scenario, updateScenario } = props;
  const updatedAtDate = Number(scenario?.updatedAt.toDate());

  const handleScenarioChange = (scenarioChange: object) => {
    updateScenario(Object.assign({}, scenario, scenarioChange));
  };

  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(scenario?.name);
  const [description, setDescription] = useState(scenario?.description);

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
              <IconFolder alt="folder" src={iconFolderSrc} />
              <span>{name}</span>
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
        <InputDescription
          description={description}
          setDescription={setDescription}
        />
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
            text={
              "Turn on 'Daily Reports' to receive briefings based on the data in this scenario, prepared by Recidiviz and CSG."
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ScenarioSidebar;
