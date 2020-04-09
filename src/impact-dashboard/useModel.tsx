import {
  EpidemicModelUpdate,
  useEpidemicModelDispatch,
  useEpidemicModelState,
} from "./EpidemicModelContext";

export default function useModel() {
  const dispatch = useEpidemicModelDispatch();
  const model = useEpidemicModelState();

  function updateModel(update: EpidemicModelUpdate) {
    dispatch({ type: "update", payload: update });
  }

  return [model, updateModel] as [typeof model, typeof updateModel];
}
