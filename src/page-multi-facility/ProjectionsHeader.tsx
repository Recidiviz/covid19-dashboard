import hexAlpha from "hex-alpha";
import styled from "styled-components";

import Colors, { MarkColors as markColors } from "../design-system/Colors";

const HeaderContainer = styled.div`
  border-color: ${Colors.opacityGray};
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
`;

const LegendCircle = styled.div`
  background-color: ${(props) => props.color};
  width: 5px;
  height: 5px;
  border-radius: 50%;
  margin-right: 4px;
`;

const LegendText = styled.div`
  color: ${Colors.forest};
  opacity: 0.7;
  font-family: "Poppins", sans-serif;
  font-size: 9px;
  font-weight: 600;
  line-height: 16px;
`;

const ProjectionsHeader: React.FC = () => {
  return (
    <HeaderContainer className="border-t border-b mt-5 mb-5 py-2 flex flex-row">
      <div className="w-2/5 flex flex-row">
        <LegendText className="w-1/4">Cases</LegendText>
        <LegendText className="w-3/4">Facility</LegendText>
      </div>
      <div className="w-3/5 flex flex-row justify-start">
        <LegendItem className="ml-6">
          <LegendCircle color={markColors.fatalities} />
          <LegendText>Fatalities</LegendText>
        </LegendItem>
        <LegendItem className="ml-6">
          <LegendCircle color={markColors.exposed} />
          <LegendText>Exposed</LegendText>
        </LegendItem>
        <LegendItem className="ml-6">
          <LegendCircle color={markColors.infectious} />
          <LegendText>Infectious</LegendText>
        </LegendItem>
        <LegendItem className="ml-6">
          <LegendCircle color={markColors.hospitalized} />
          <LegendText>Hospitalized</LegendText>
        </LegendItem>
      </div>
    </HeaderContainer>
  );
};

export default ProjectionsHeader;
