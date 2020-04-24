import { cloneDeep } from "lodash";
import React from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import InputSelect from "../design-system/InputSelect";
import Description from "../impact-dashboard/Description";
import {
  PlannedRelease,
  PlannedReleases,
  RateOfSpread,
} from "../impact-dashboard/EpidemicModelContext";
import {
  FormGrid,
  FormGridCell,
  FormGridRow,
} from "../impact-dashboard/FormGrid";
import {
  rateOfSpreadDisplayText,
  ReleaseRow,
  ReleaseUpdate,
} from "../impact-dashboard/MitigationInformation";
import useModel from "../impact-dashboard/useModel";

const borderStyle = `1px solid ${Colors.paleGreen}`;

const RateOfSpreadDiv = styled.div`
  border-top: ${borderStyle};
`;

const SectionHeader = styled.header`
  font-family: Libre Baskerville;
  font-weight: normal;
  font-size: 19px;
  line-height: 24px;
  padding: 20px 0;
  color: ${Colors.forest};
  letter-spacing: -0.06em;
`;

const RateOfSpreadSection: React.FC = () => {
  const [
    { plannedReleases = [{}], rateOfSpreadFactor },
    updateModel,
  ] = useModel();
  // all updates should be happen on this mutable copy,
  // which will replace the model state after user input
  const mutableReleases = cloneDeep(plannedReleases);

  const updateReleases = (newValue: PlannedReleases): void => {
    updateModel({ plannedReleases: newValue });
  };

  const updateRelease = (opts: ReleaseUpdate): void => {
    const { index, update } = opts;
    mutableReleases[index] = Object.assign(
      mutableReleases[index] || {},
      update,
    );
    updateReleases(mutableReleases);
  };

  return (
    <RateOfSpreadDiv>
      <SectionHeader>Rate of Spread</SectionHeader>
      <Description className="mb-10">
        Select the most likely rate of spread. This will change the R0 (rate of
        spread) in the model.
      </Description>
      <FormGrid>
        <FormGridRow>
          <FormGridCell>
            <InputSelect
              onChange={(e) =>
                updateModel({
                  rateOfSpreadFactor: e.target.value as RateOfSpread,
                })
              }
              value={rateOfSpreadFactor}
            >
              {Object.values(RateOfSpread).map((val) => (
                <option key={val} value={val}>
                  {rateOfSpreadDisplayText[val]}
                </option>
              ))}
            </InputSelect>
          </FormGridCell>
        </FormGridRow>
      </FormGrid>
      <Description>
        Enter planned reductions in the in-facility population (e.g., early
        releases to supervision).
      </Description>
      <FormGrid>
        {mutableReleases?.map(({ date, count }, index) => (
          <ReleaseRow
            key={index}
            date={date}
            count={count}
            index={index}
            updateRelease={updateRelease}
          />
        ))}
      </FormGrid>
    </RateOfSpreadDiv>
  );
};

export default RateOfSpreadSection;
