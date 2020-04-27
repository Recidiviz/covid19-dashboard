import { Scenario } from "../page-multi-facility/types";
import { useScenarioDispatch, useScenarioState } from "./ScenarioContext";

export default function useScenario() {
  const dispatch = useScenarioDispatch();
  const scenario = useScenarioState();

  function dispatchScenarioUpdate(scenario: Scenario) {
    dispatch({
      type: "update",
      payload: {
        data: scenario,
        loading: false,
      },
    });
  }

  return [scenario, dispatchScenarioUpdate] as [
    typeof scenario,
    typeof dispatchScenarioUpdate,
  ];
}
