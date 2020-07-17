import React from "react";
import styled from "styled-components";

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

export default function ImpactToDateTable({}) {
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
                  <Left>4</Left>
                </TextContainer>
              </ImpactStatContainer>
            </TableCell>
            <TableCell>
              <ImpactStatContainer>
                <BorderDiv />
                Staff lives saved
                <HorizontalRule />
                <TextContainer>
                  <Left>4</Left>
                </TextContainer>
              </ImpactStatContainer>
            </TableCell>
            <TableCell>
              <ImpactStatContainer>
                <BorderDiv />
                Incarcerated cases prevented
                <HorizontalRule />
                <TextContainer>
                  <Left>4</Left>
                </TextContainer>
              </ImpactStatContainer>
            </TableCell>
            <TableCell>
              <BorderDiv />
              Staff cases prevented
              <HorizontalRule />
              <TextContainer>
                <Left>4</Left>
              </TextContainer>
            </TableCell>
          </tr>
        </tbody>
      </Table>
      <HorizontalRule />
    </ImpactToDateTableContainer>
  );
}
