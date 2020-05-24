import hexAlpha from "hex-alpha";
import React, { useContext, useState } from "react";
import styled from "styled-components";

import { FacilityContext } from "../../contexts/facility-context/FacilityContext";
import { RtData } from "../../infection-model/rt";
import { updateFacilityRtData } from "../../infection-model/rt";
import { Facility } from "../../page-multi-facility/types";
import AddCasesModal from "../AddCasesModal";
import Colors from "../design-system/Colors";
import HelpButtonWithTooltip from "../design-system/HelpButtonWithTooltip";
import Loading from "../design-system/Loading";
import RtTimeseries from "./RtTimeseries";

const borderStyle = `1px solid ${Colors.paleGreen}`;

const ChartHeader = styled.div`
  align-items: baseline;
  border-bottom: ${borderStyle};
  display: flex;
  justify-content: space-between;
`;

const ChartTitle = styled.div`
  color: ${hexAlpha(Colors.forest, 0.7)};
  font-family: "Poppins", sans-serif;
  font-size: 9px;
  font-weight: 600;
  padding: 5px 0;
`;

const AddCasesRow = styled.div`
  margin-bottom: 16px;
`;

const RtChartEmptyState = styled.button`
  display: flex;
  align-items: center;
  text-align: center;
  border: 1px solid ${Colors.darkRed};
  border-radius: 2px;
  background-color: ${Colors.darkRed10};
  color: ${Colors.darkRed};
  padding: 20px;
  height: 200px;
`;

interface Props {
  data?: RtData | null;
  facility: Facility;
}

const RtTimeseriesContainer: React.FC<Props> = ({ data }) => {
  const { facility: initialFacility, dispatchRtData } = useContext(
    FacilityContext,
  );
  const [facility, updateFacility] = useState(initialFacility);

  const onModalSave = (newFacility: Facility) => {
    updateFacility(newFacility);
    updateFacilityRtData(newFacility, dispatchRtData);
  };

  const isLoading = data === undefined;
  const notEnoughData = data === null || (data && data.Rt.length < 2);

  if (isLoading) return <Loading />;

  return (
    <>
      <ChartHeader>
        <ChartTitle>Rate of Spread</ChartTitle>
        {data && (
          <HelpButtonWithTooltip>
            This chart shows the rate of spread of Covid-19 over time. When the
            Rt value is above 1 (the red line), the virus is spreading. If the
            Rt value is below 1, the virus is on track to be extinguished at
            this facility.
          </HelpButtonWithTooltip>
        )}
      </ChartHeader>

      {notEnoughData
        ? facility && (
            <AddCasesRow>
              <AddCasesModal
                facility={facility}
                trigger={
                  <RtChartEmptyState>
                    Live rate of spread could not be calculated for this
                    facility. Click here to add at least 3 days of confirmed
                    case data.
                  </RtChartEmptyState>
                }
                onSave={onModalSave}
              />
            </AddCasesRow>
          )
        : data && <RtTimeseries data={data} />}
    </>
  );
};

export default RtTimeseriesContainer;
