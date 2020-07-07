import React from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";

const PageContainer = styled.div`
  min-height: 500px;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  font-size: 11px;
  font-weight: 400;
  font-family: "Libre Franklin";
`;

const HorizontalRule = styled.hr`
  border-color: ${Colors.opacityGray};
  margin: 10px 0;
`;

const PageWidthContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  font-family: Libre Franklin;
  font-size: 11px;
  line-height: 14px;
`;

const FooterLeft = styled.div`
  text-align: left;
`;

const FooterRight = styled.div`
  text-align: right;
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

const PageSubheader = styled.div`
  text-align: right;
  padding-top: 25px;
  font-weight: 200;
`;

const Emphasize = styled.span`
  font-weight: 900;
  font-size: 12px;
`;

const Body = styled.div`
  flex-grow: 1;
`;

interface Props {
  header: string;
  subheader?: boolean | undefined;
  children: React.ReactNode;
}

const Page: React.FC<Props> = ({ header, subheader, children }) => {
  return (
    <PageContainer>
      <PageWidthContainer>
        <PageHeader>{header}</PageHeader>
        {subheader && (
          <PageSubheader>
            Weekly snapshot provided by <Emphasize>recidiviz</Emphasize>
          </PageSubheader>
        )}
      </PageWidthContainer>
      <Body>{children}</Body>
      <HorizontalRule />
      <PageWidthContainer>
        <FooterLeft>Log in to update data: model.recividiz.org</FooterLeft>
        <FooterRight>Questions and feedback: covid@recidiviz.org</FooterRight>
      </PageWidthContainer>
      <HorizontalRule />
    </PageContainer>
  );
};

export default Page;
