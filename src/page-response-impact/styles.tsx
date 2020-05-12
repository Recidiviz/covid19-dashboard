import styled from "styled-components";

import Colors from "../design-system/Colors";

export const ResponseImpactDashboardContainer = styled.div``;

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
  padding: 40px 0 24px;
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
  padding: 40px 0 24px;
  text-transform: uppercase;
`;

export const BackDiv = styled.div`
  font-family: Poppins;
  font-style: normal;
  font-weight: normal;
  font-size: 10px;
  line-height: 150%;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: ${Colors.green};
  display: flex;
  align-items: center;
  justify-items: center;
`;

export const IconBack = styled.img`
  margin-right: 6px;
`;

export const ReportDateDiv = styled.div`
  font-family: Helvetica Neue;
  font-style: normal;
  font-weight: 300;
  font-size: 14px;
  line-height: 150%;
  color: ${Colors.opacityForest};
`;

export const DescriptionTextDiv = styled.div`
  font-family:  "Poppins", sans-serif;
  font-style: normal;
  font-weight: normal;
  font-size: 13px;
  line-height: 150%;
  color: ${Colors.forest50};
`;

export const SectionHeaderBare = styled.h1`
  font-family: "Libre Baskerville";
  font-weight: normal;
  font-size: 19px;
  line-height: 24px;
  letter-spacing: -0.06em;
  color: ${Colors.forest};
`;

export const TakeActionBox = styled.div`
  background-color: ${Colors.gray};
  border-radius: 4px;
  padding: 40px;
`;

export const TakeActionText = styled.div`
  font-family: Poppins;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 150%;
  color: ${Colors.opacityForest};
`;

export const TakeActionLink = styled.span`
  color: ${Colors.teal};
`;

export const TakeActionBullet = styled.li`
  font-family: Poppins;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 150%;
  color: ${Colors.opacityForest};
  list-style: disc inside;
  padding-left: 24px;
`;
