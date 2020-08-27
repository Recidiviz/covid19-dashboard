import {
  ReferenceDataModalAction,
  ReferenceDataModalState,
} from "./ReferenceDataModalContext";

export function referenceDataModalReducer(
  state: ReferenceDataModalState,
  action: ReferenceDataModalAction,
) {
  switch (action.type) {
    case "UPDATE":
      return { ...state, ...action.payload };

    default:
      return state;
  }
}
