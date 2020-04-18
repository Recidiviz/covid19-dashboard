import { format } from "date-fns";

import { saveScenario } from "../database/index";
import PromoBoxWithButton from "../design-system/PromoBoxWithButton";
import ToggleRow from "./ToggleRow";
import { Scenario } from "./types";

interface Props {
  scenario?: Scenario | null;
}

const ScenarioSidebar: React.FC<Props> = (props) => {
  const { scenario } = props;
  const updatedAtDate = Number(scenario?.updatedAt.toDate());

  const handleToggle = (toggleValue: keyof Scenario) => {
    const value = scenario?.[toggleValue];
    // TODO: I think the default value is still set to false for both dataSharing and dailyReports
    saveScenario({
      ...scenario,
      [toggleValue]: !value,
    });
  };

  return (
    <div className="flex flex-col w-1/4 mr-24">
      <div className="flex-1 flex flex-col pb-4">
        <h1 className="text-3xl leading-none">{scenario?.name}</h1>
        <div className="mt-5 mb-5 border-b border-gray-300" />
        <div className="mb-12">
          <p>
            This text describes unique qualities for this data model. Taking
            notes here will be useful when you have multiple data model
            experiments in your library?
          </p>
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
            onToggle={() => handleToggle("dailyReports")}
            toggled={scenario?.dailyReports}
            label="Daily Reports"
            labelHelp="Tooltip help Lorem ipsum dolor sit amet, consectetur adipiscing elit"
          />
          <ToggleRow
            onToggle={() => handleToggle("dataSharing")}
            toggled={scenario?.dataSharing}
            label="Data Sharing"
            labelHelp="Tooltip help Lorem ipsum dolor sit amet, consectetur adipiscing elit"
          />
          <PromoBoxWithButton
            text={
              "Turn on 'DailyReports' to receive Lorem ipsum dolor sit amet, consectetur adipiscing elit"
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ScenarioSidebar;
