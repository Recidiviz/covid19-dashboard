import styled from "styled-components";

import { MarkColors as markColors } from "../design-system/Colors";

const LegendCircle = styled.span`
  color: ${(props) => props.color};
  font-size: 18px;
`;

const ProjectionsHeader: React.FC = () => {
  return (
    <div className="border-t border-b border-gray-300 mt-5 mb-5 py-2 flex flex-row">
      <div className="w-2/5 flex flex-row">
        <div className="w-1/4">Cases</div>
        <div className="w-3/4">Facility</div>
      </div>
      <div className="w-3/5 flex flex-row justify-between">
        <div>Projection</div>
        <div>
          <span className="ml-6">
            <LegendCircle color={markColors.fatalities}>•</LegendCircle> Fatalities
          </span>
          <span className="ml-6">
            <LegendCircle color={markColors.exposed}>•</LegendCircle> Exposed
          </span>
          <span className="ml-6">
            <LegendCircle color={markColors.infectious}>•</LegendCircle> Infectious
          </span>
          <span className="ml-6">
            <LegendCircle color={markColors.hospitalized}>•</LegendCircle> Hospitalized
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectionsHeader;
