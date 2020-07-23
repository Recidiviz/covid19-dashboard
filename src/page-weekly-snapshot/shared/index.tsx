import styled from "styled-components";

import Colors from "../../design-system/Colors";

export const COLUMN_SPACING = "20px";
export const TOP_BOTTOM_MARGIN = "10px";

export const DELTA_DIRECTION_MAPPING = {
  positive: "↑ ",
  negative: "↓ ",
  same: "↑ ",
};

export const STATE_CODE_MAPPING = {
  "Alabama": "AL",
  "Alaska": "AK",
  "Arizona": "AZ",
  "Arkansas": "AR",
  "California": "CA",
  "Colorado": "CO",
  "Connecticut": "CT",
  "Delaware": "DE",
  "District Of Columbia": "DC",
  "Florida": "FL",
  "Georgia": "GA",
  "Hawaii": "HI",
  "Idaho": "ID",
  "Illinois": "IL",
  "Indiana": "IN",
  "Iowa": "IA",
  "Kansas": "KS",
  "Kentucky": "KY",
  "Louisiana": "LA",
  "Maine": "ME",
  "Maryland": "MD",
  "Massachusetts": "MA",
  "Michigan": "MI",
  "Minnesota": "MN",
  "Mississippi": "MS",
  "Missouri": "MO",
  "Montana": "MT",
  "Nebraska": "NE",
  "Nevada": "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  "Ohio": "OH",
  "Oklahoma": "OK",
  "Oregon": "OR",
  "Pennsylvania": "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  "Tennessee": "TN",
  "Texas": "TX",
  "Utah": "UT",
  "Vermont": "VT",
  "Virginia": "VA",
  "Washington": "WA",
  "West Virginia": "WV",
  "Wisconsin": "WI",
  "Wyoming": "WY",
};

export const Delta = styled.div<{ deltaDirection?: string }>`
  color: ${(props) =>
    props.deltaDirection == "positive"
      ? Colors.red
      : props.deltaDirection == "negative"
      ? Colors.green
      : Colors.gray};
`;

export const TableHeading = styled.th`
  width 25%;
`;

export const Table = styled.table`
  color: ${Colors.black};
  text-align: left;
  width: 100%;
  margin-top: 10px;
  table-layout: fixed;
`;

export const BorderDiv = styled.div<{ marginRight?: string }>`
  border-top: 1px solid ${Colors.black};
  margin-right: ${(props) => props.marginRight || "0px"};
`;

export const HorizontalRule = styled.hr<{ marginRight?: string }>`
  border-color: ${Colors.opacityGray};
  margin-top: 10px;
  margin-right: ${(props) => props.marginRight || "0px"};
`;

export const TableHeadingCell = styled.td`
  font-family: "Libre Franklin";
  font-weight: bold;
  font-size: 11px;
  line-height: 13px;
  vertical-align: middle;
`;

export const RankContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-start;
  height: 100%;
  align-items: baseline;
`;

export const RankText = styled.td`
  font-family: "Libre Franklin";
  font-size: 11px;
  margin-right: 10px;
  align-items: baseline;
`;

export const LeftHeading = styled.div<{ marginTop?: string }>`
  margin-top: ${(props) => props.marginTop || TOP_BOTTOM_MARGIN};
  text-align: left;
`;

export const TextContainerHeading = styled.div<{
  marginTop?: string;
  marginBottom?: string;
}>`
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-top: ${TOP_BOTTOM_MARGIN};
  margin-bottom: ${TOP_BOTTOM_MARGIN};
  align-items: baseline;
  line-height: 40px;
`;

export const TextContainer = styled.div`
  width: 100%;
  margin: 15px 0 15px;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  color: ${Colors.black};
`;

export const Right = styled.div<{ marginRight?: string; marginTop?: string }>`
  text-align: right;
  margin-top: ${(props) => props.marginTop || "0px"};
  margin-right: ${(props) => props.marginRight || "0px"};
`;

export const Left = styled.div<{
  marginRight?: string;
  marginTop?: string;
  marginBottom?: string;
  color?: string;
}>`
  text-align: left;
  font-size: 24px;
  font-family: "Libre Baskerville";
  margin-right: ${(props) => props.marginRight || "0px"};
  margin-top: ${(props) => props.marginTop || "0px"};
  margin-bottom: ${(props) => props.marginBottom || "0px"};
  color: ${Colors.black};
`;

export const TableCell = styled.td<{ label?: boolean }>`
  font-size: 11px;
  line-height: 200%;
  text-align: "left";
  width: ${(props) => (props.label ? "200px" : "auto")};
`;

export const Heading = styled.div`
  font-weight: 700;
  line-height: 13px;
  border-top: 1px solid ${Colors.darkGray};
  padding: 10px 0;
`;

export const DeltaContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const SnapshotPageContainer = styled.div`
  min-height: 500px;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  font-size: 11px;
  font-weight: 400;
  font-family: "Libre Franklin";
`;

export const PageWidthContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  font-family: Libre Franklin;
  font-size: 11px;
  line-height: 14px;
`;

export const PageHeader = styled.div`
  font-size: 43px;
  line-height: 45px;
  letter-spacing: -0.07em;
  margin-bottom: 3px;
  font-family: "Libre Baskerville";
  text-align: left;
  padding-top: 10px;
`;

export const PageSubheader = styled.div`
  text-align: right;
  padding-top: 25px;
  font-weight: 200;
`;

export const Emphasize = styled.span`
  font-weight: 900;
  font-size: 12px;
`;

export const Body = styled.div`
  flex-grow: 1;
`;

export const Image = styled.img`
  display: block;
  width: 50px;
  height: 50px;
  -moz-border-radius: 40px;
  -webkit-border-radius: 40px;
  border: 1px solid black;
  padding: 5px;
  margin-top: 10px;
  margin-bottom: -10px;
`;

export const ImageContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: baseline;
`;

export const ImageLeft = styled.div`
  margin-right: 20px;
`;
