import { isAfter } from "date-fns";
import { navigate } from "gatsby";
import { size } from "lodash";
import React, { useEffect, useReducer } from "react";

import { referenceFacilitiesProp, saveScenario } from "../../../database";
import { useFacilities } from "../../../facilities-context";
import useIsOwnScenario from "../../../hooks/useIsOwnScenario";
import useRejectionToast from "../../../hooks/useRejectionToast";
import useScenario from "../../../scenario-context/useScenario";
import { getUnmappedReferenceFacilities } from "../shared";
import SyncNewFacility from "../SyncNewFacility";
import SyncNewReferenceData from "../SyncNewReferenceData";
import SyncNoUserFacilities from "../SyncNoUserFacilities";
import { referenceDataModalReducer } from "./reducers";

export interface ReferenceDataModalState {
  canSyncNewFacility?: boolean;
  newFacilityIdToSync?: string;
  renderSyncButton: boolean;
  showSyncNewReferenceData: boolean;
  useExistingFacilities?: boolean;
}

export type ReferenceDataModalAction = {
  type: "UPDATE";
  payload: Partial<ReferenceDataModalState>;
};
type ReferenceDataModalDispatch = (action: ReferenceDataModalAction) => void;

interface ReferenceDataModalContext {
  state: ReferenceDataModalState;
  dispatch: ReferenceDataModalDispatch;
}

const ReferenceDataModalContext = React.createContext<
  ReferenceDataModalContext | undefined
>(undefined);

type SyncType = "single" | "all";

export const ReferenceDataModalProvider: React.FC<{ syncType: SyncType }> = ({
  children,
  syncType,
}) => {
  const [state, dispatch] = useReducer(referenceDataModalReducer, {
    renderSyncButton: false,
    showSyncNewReferenceData: false,
  });
  const [{ data: scenario }, dispatchScenarioUpdate] = useScenario();
  const {
    state: facilitiesState,
    actions: { deselectFacility },
  } = useFacilities();

  const featureAvailable = facilitiesState.referenceDataFeatureAvailable;

  const featureActive = scenario?.useReferenceData;

  const isOwnScenario = useIsOwnScenario(scenario);

  const haveReferenceFacilities = Boolean(
    size(facilitiesState.referenceFacilities),
  );

  const haveFacilities = Boolean(size(facilitiesState.facilities));

  const haveUnmappedReferenceFacilities =
    scenario &&
    haveReferenceFacilities &&
    Boolean(
      getUnmappedReferenceFacilities(
        scenario[referenceFacilitiesProp],
        facilitiesState.referenceFacilities,
      ).length,
    );

  const renderSyncNoUserFacilities =
    featureAvailable &&
    featureActive &&
    isOwnScenario &&
    syncType === "all" &&
    !facilitiesState.loading &&
    !haveFacilities;

  const renderSyncModal =
    featureAvailable &&
    featureActive &&
    isOwnScenario &&
    haveFacilities &&
    haveReferenceFacilities;

  const showSyncNewReferenceDataBase = renderSyncModal && syncType === "all";
  useEffect(() => {
    dispatch({
      type: "UPDATE",
      payload: { renderSyncButton: Boolean(renderSyncModal) },
    });
  }, [renderSyncModal]);

  useEffect(() => {
    if (
      showSyncNewReferenceDataBase &&
      haveUnmappedReferenceFacilities &&
      (!scenario?.referenceDataObservedAt ||
        Object.values(facilitiesState.referenceFacilities).some(
          (refFacility) => {
            return (
              scenario?.referenceDataObservedAt &&
              isAfter(refFacility.createdAt, scenario.referenceDataObservedAt)
            );
          },
        ))
    ) {
      dispatch({
        type: "UPDATE",
        payload: { showSyncNewReferenceData: true },
      });
    }
  }, [
    facilitiesState.referenceFacilities,
    haveUnmappedReferenceFacilities,
    scenario,
    showSyncNewReferenceDataBase,
  ]);

  const canSyncNewFacility = Boolean(
    renderSyncModal && syncType === "single" && haveUnmappedReferenceFacilities,
  );

  useEffect(() => {
    dispatch({ type: "UPDATE", payload: { canSyncNewFacility } });
  }, [canSyncNewFacility]);

  const rejectionToast = useRejectionToast();

  const handleScenarioChange = (scenarioChange: any) => {
    const changes = Object.assign({}, scenario, scenarioChange);
    rejectionToast(
      saveScenario(changes).then(() => dispatchScenarioUpdate(changes)),
    );
  };

  // scenario?.promoStatuses.referenceData
  // setReferenceDataModalOpen(Boolean(scenario?.promoStatuses?.referenceData));

  const firstFacility = Object.values(facilitiesState.facilities)[0];
  let stateName;
  let systemType;
  if (firstFacility) {
    systemType = firstFacility.systemType;
    stateName = firstFacility.modelInputs.stateName;
  }

  const closeSyncNewReferenceData = () =>
    dispatch({ type: "UPDATE", payload: { showSyncNewReferenceData: false } });

  return (
    <ReferenceDataModalContext.Provider value={{ state, dispatch }}>
      {children}
      {renderSyncNoUserFacilities && <SyncNoUserFacilities />}
      {renderSyncModal && syncType === "all" && (
        <SyncNewReferenceData
          open={state.showSyncNewReferenceData}
          closeModal={closeSyncNewReferenceData}
          stateName={stateName}
          systemType={systemType}
          onClose={() => {
            dispatch({
              type: "UPDATE",
              payload: {
                showSyncNewReferenceData: false,
                useExistingFacilities: false,
              },
            });
            // only want to show this once as a promo;
            // closing the modal should dismiss the promo status
            if (scenario?.promoStatuses.referenceData) {
              handleScenarioChange({
                promoStatuses: {
                  ...scenario.promoStatuses,
                  referenceData: false,
                },
              });
            }
          }}
          useExistingFacilities={state.useExistingFacilities}
        />
      )}
      {canSyncNewFacility && (
        <SyncNewFacility
          facilityId={state.newFacilityIdToSync}
          onClose={() => {
            deselectFacility();
            navigate("/");
          }}
        />
      )}
    </ReferenceDataModalContext.Provider>
  );
};

export function useReferenceDataModal() {
  const context = React.useContext(ReferenceDataModalContext);

  if (context === undefined) {
    throw new Error(
      "useReferenceDataModal must be used within a ReferenceDataModalProvider",
    );
  }

  return context;
}
