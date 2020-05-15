import { format } from "date-fns";
import { navigate } from "gatsby";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { saveScenario } from "../database";
import Colors from "../design-system/Colors";
import iconCheckSrc from "../design-system/icons/ic_check.svg";
import iconFolderSrc from "../design-system/icons/ic_folder.svg";
import InputButton from "../design-system/InputButton";
import InputDescription from "../design-system/InputDescription";
import InputName from "../design-system/InputName";
import PromoBoxWithButton from "../design-system/PromoBoxWithButton";
import { Spacer } from "../design-system/Spacer";
import { Flag, useFlag } from "../feature-flags";
import useRejectionToast from "../hooks/useRejectionToast";
import useScenario from "../scenario-context/useScenario";
import ScenarioShareButton from "../scenario-share/ScenarioShareButton";
import ScenarioLibraryModal from "./ScenarioLibraryModal";
import { Scenario } from "./types";

const HorizontalRule = styled.hr`
  border-color: ${Colors.opacityGray};
`;

const ScenarioName = styled.div`
  border-bottom: 1px solid ${Colors.paleGreen};
  display: flex;
`;

const IconFolder = styled.img`
  display: inline;
  width: 12px;
  height: 12px;
  margin-right: 12px;
`;

interface ToggleContainerProps {
  hidden?: boolean;
}

interface Props {
  numFacilities?: number | null;
}

interface BaselineIndicatorProps {
  baseline?: boolean;
}

const BaselineIndicator = styled.div<BaselineIndicatorProps>`
  display: ${(props) => (props.baseline ? "flex" : "none")};
  align-items: center;
`;

const IconCheck = styled.img`
  display: inline;
  width: 12px;
  height: 12px;
  margin-left: 6px;
`;

export function getEnabledPromoType(
  scenario?: Scenario | null,
  numFacilities?: number | null,
) {
  if (!scenario) return null;

  const { promoStatuses } = scenario;

  return promoStatuses.rtChart
    ? "rtChart"
    : numFacilities && numFacilities < 3 && promoStatuses?.addFacilities
    ? "addFacilities"
    : null;
}

const promoTexts: { [promoType: string]: string } = {
  addFacilities:
    "Add additional facilities to see the impact across your entire system.",
  rtChart: `New! View the chart of Rt (the rate of spread over time) for any
    facility by selecting it. This is based on the number of cases over time
    for that facility. To get an accurate Rt, enter case counts for previous
    days by clicking the number of cases on the right (in red) to update case
    numbers.`,
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

  const rejectionToast = useRejectionToast();

  const handleScenarioChange = (scenarioChange: any) => {
    const changes = Object.assign({}, scenario, scenarioChange);
    rejectionToast(
      saveScenario(changes).then(() => dispatchScenarioUpdate(changes)),
    );
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
  // need this to force a form state refresh when switching scenarios
  const [renderKey, setRenderKey] = useState(scenario?.id);

  const promoType: string | null = getEnabledPromoType(scenario, numFacilities);

  useEffect(() => {
    setName(scenario?.name);
    setDescription(scenario?.description);
    setRenderKey(scenario?.id);
  }, [scenario]);

  return (
    <div className="flex flex-col w-1/4 mr-24" key={renderKey}>
      <div className="flex-1 flex flex-col pb-4">
        <ScenarioName>
          <div className="flex-none">
            <ScenarioLibraryModal
              trigger={
                <IconFolder
                  style={{
                    marginTop: "8px",
                  }}
                  alt="folder"
                  src={iconFolderSrc}
                />
              }
            />
          </div>
          <InputName
            name={name}
            setName={setName}
            placeholderValue={scenario?.name}
            placeholderText="Scenario name is required"
            maxLengthValue={124}
            requiredFlag={true}
            persistChanges={handleTextInputChange}
          />
        </ScenarioName>
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
        <div className="flex justify-between">
          <div>
            <p className="text-xs text-gray-500">
              Last Update:{" "}
              {updatedAtDate && format(updatedAtDate, "MMMM d, yyyy")}
            </p>
          </div>
          <BaselineIndicator baseline={scenario?.baseline}>
            <p className="text-xs text-gray-500">Baseline</p>
            <IconCheck alt="check" src={iconCheckSrc} />
          </BaselineIndicator>
        </div>
        <Flag name={["enableSharing"]}>
          <div>
            <Spacer y={20} />
            <HorizontalRule />
            <Spacer y={20} />
            <ScenarioShareButton />
          </div>
        </Flag>
        <div>
          <Spacer y={20} />
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
                fontFamily: "Rubik, sans-serif",
                width: "100%",
                marginTop: "20px",
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
