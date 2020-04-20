import { sentenceCase } from "change-case";
import styled from "styled-components";

import { seirIndex, seirIndexList } from "../infection-model/seir";
import { getMarkColor } from "./helpers";

const LegendWrapper = styled.div`
  display: flex;
`;

const LegendItem = styled.div`
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.15em;
  border-bottom: 1px solid;
  border-color: ${(props) => props.color};
  margin: 0 1em;
  font-weight: normal;
  padding-bottom: 0.6em;
`;

const ModelOutputChartLegend: React.FC = () => {
  return (
    <LegendWrapper>
      {seirIndexList.map((i) => (
        <LegendItem key={i} color={getMarkColor(i.toString())}>
          {sentenceCase(seirIndex[i])}
        </LegendItem>
      ))}
    </LegendWrapper>
  );
};

export default ModelOutputChartLegend;
