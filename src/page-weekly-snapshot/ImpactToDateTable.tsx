import numeral from "numeral";
import React from "react";
import styled from "styled-components";

import { TableData } from "./projectionChartUtils";
import {
  BorderDiv,
  HorizontalRule,
  Left,
  Right,
  Table,
  TableCell,
  TableHeadingCell,
  TextContainer,
  TextContainerHeading,
} from "./shared";

const ImpactToDateTableContainer = styled.div`
  margin: 0 3vw 3vw;
`;

const ImpactStatContainer = styled.div`
  margin-right: 3vw;
`;

const formatValue = (n: number) => numeral(n).format("0,0");

const ImpactToDateTable: React.FC<TableData> = ({
  staffCasesToday,
  staffFatalitiesToday,
  incarceratedCasesToday,
  incarceratedFatalitiesToday,
  projectedStaffCasesToday,
  projectedStaffFatalitiesToday,
  projectedIncarceratedCasesToday,
  projectedIncarceratedFatalitiesToday,
}) => {
  const incarceratedLivesSaved =
    projectedIncarceratedFatalitiesToday - incarceratedFatalitiesToday;
  const staffLivesSaved = projectedStaffFatalitiesToday - staffFatalitiesToday;
  const incarceratedCasesPrevented =
    projectedIncarceratedCasesToday - incarceratedCasesToday;
  const staffCasesPrevented = projectedStaffCasesToday - staffCasesToday;

  return (
    <ImpactToDateTableContainer>
      <HorizontalRule />
      <Table>
        <thead>
          <tr>
            <TableHeadingCell>
              <TextContainerHeading>
                <Right>Intervention Impact To-Date</Right>
              </TextContainerHeading>
            </TableHeadingCell>
          </tr>
        </thead>
        <tbody>
          <tr>
            <TableCell>
              <ImpactStatContainer>
                <BorderDiv />
                Incarcerated lives saved
                <HorizontalRule />
                <TextContainer>
                  <Left>{formatValue(incarceratedLivesSaved)}</Left>
                </TextContainer>
              </ImpactStatContainer>
            </TableCell>
            <TableCell>
              <ImpactStatContainer>
                <BorderDiv />
                Staff lives saved
                <HorizontalRule />
                <TextContainer>
                  <Left>{formatValue(staffLivesSaved)}</Left>
                </TextContainer>
              </ImpactStatContainer>
            </TableCell>
            <TableCell>
              <ImpactStatContainer>
                <BorderDiv />
                Incarcerated cases prevented
                <HorizontalRule />
                <TextContainer>
                  <Left>{formatValue(incarceratedCasesPrevented)}</Left>
                </TextContainer>
              </ImpactStatContainer>
            </TableCell>
            <TableCell>
              <BorderDiv />
              Staff cases prevented
              <HorizontalRule />
              <TextContainer>
                <Left>{formatValue(staffCasesPrevented)}</Left>
              </TextContainer>
            </TableCell>
          </tr>
        </tbody>
      </Table>
      <HorizontalRule />
    </ImpactToDateTableContainer>
  );
};

export default ImpactToDateTable;
