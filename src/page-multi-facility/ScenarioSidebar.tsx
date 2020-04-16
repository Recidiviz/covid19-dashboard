import PromoBoxWithButton from "../design-system/PromoBoxWithButton";
import ToggleRow from "./ToggleRow";

const ScenarioSidebar: React.FC = () => {
  return (
    <div className="flex flex-col w-1/4 mr-24">
      <div className="flex-1 flex flex-col pb-4">
        <h1 className="text-3xl leading-none">Model 01</h1>
        <div className="mt-5 mb-5 border-b border-gray-300" />
        <div className="mb-12">
          <p>
            This text describes unique qualities for this data model. Taking
            notes here will be useful when you have multiple data model
            experiments in your library?
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Last Update: March 25, 2020</p>
        </div>
        <div className="mt-5 mb-5 border-b border-gray-300" />
        <div>
          <ToggleRow
            label="Daily Reports"
            labelHelp="Tooltip help Lorem ipsum dolor sit amet, consectetur adipiscing elit"
          />
          <ToggleRow
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
