import styled from "styled-components";

import Colors from "../design-system/Colors";

export const ResponseImpactDashboardContainer = styled.div``;

export const ScenarioName = styled.div`
  font-family: Poppins;
  font-size: 10px;
  font-weight: normal;
  line-height: 150%;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: ${Colors.green};
  padding: 10px 0;
`;
export const PageHeader = styled.h1`
  color: ${Colors.forest};
  font-family: "Libre Baskerville";
  font-weight: normal;
  font-size: 24px;
  line-height: 24px;
  letter-spacing: -0.06em;
  padding: 24px 0;
`;
export const SectionHeader = styled.h1`
  color: ${Colors.forest};
  border-top: 1px solid ${Colors.opacityGray};
  font-family: "Libre Baskerville";
  font-weight: normal;
  font-size: 19px;
  line-height: 24px;
  letter-spacing: -0.06em;
  padding: 32px 0 24px;
`;
export const PlaceholderSpace = styled.div`
  border: 1px solid ${Colors.gray};
  background-color: ${Colors.darkGray};
  height: 200px;
  margin: 20px 0;
  width: 100%;
`;
export const ChartHeader = styled.h3<{ color?: string }>`
  border-top: 1px solid ${Colors.opacityGray};
  border-bottom: 1px solid ${Colors.opacityGray};
  color: ${(props) => props.color || Colors.opacityForest};
  display: flex;
  font-family: "Poppins";
  font-style: normal;
  font-weight: 600;
  font-size: 9px;
  justify-content: space-between;
  line-height: 16px;
  margin-bottom: 15px;
  padding: 5px 0;
`;
export const SectionSubheader = styled.h2`
  color: ${Colors.darkForest};
  font-family: "Poppins";
  font-weight: normal;
  font-size: 10px;
  line-height: 150%;
  letter-spacing: 0.15em;
  padding: 32px 0 24px;
  text-transform: uppercase;
`;
