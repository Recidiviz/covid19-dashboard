import React from "react";

import {
  Body,
  Emphasize,
  FooterContainer,
  FooterText,
  HorizontalRule,
  Image,
  ImageContainer,
  ImageLeft,
  PageHeader,
  PageSubheader,
  PageWidthContainer,
  SnapshotPageContainer,
} from "./shared/index";

interface Props {
  header: string;
  subheader?: boolean | undefined;
  children: React.ReactNode;
  image?: string;
}

const SnapshotPage: React.FC<Props> = ({ header, children, image }) => {
  return (
    <SnapshotPageContainer>
      <PageWidthContainer>
        <ImageContainer>
          {image && (
            <ImageLeft>
              <Image src={image} />
            </ImageLeft>
          )}
          <PageHeader>{header}</PageHeader>
        </ImageContainer>
        <PageSubheader>
          Weekly snapshot provided by <Emphasize>recidiviz</Emphasize>
        </PageSubheader>
      </PageWidthContainer>
      <Body>{children}</Body>
      <HorizontalRule />
      <PageWidthContainer>
        <FooterContainer>
          <FooterText>Log in to update data: model.recividiz.org</FooterText>
          <FooterText>Questions and feedback: covid@recidiviz.org</FooterText>
        </FooterContainer>
      </PageWidthContainer>
      <HorizontalRule />
    </SnapshotPageContainer>
  );
};

export default SnapshotPage;
