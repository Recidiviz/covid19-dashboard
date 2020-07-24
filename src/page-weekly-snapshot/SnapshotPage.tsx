import React from "react";

import {
  Body,
  Emphasize,
  HorizontalRule,
  Image,
  ImageContainer,
  ImageLeft,
  LeftHeading,
  PageHeader,
  PageSubheader,
  PageWidthContainer,
  Right,
  SnapshotPageContainer,
  TOP_BOTTOM_MARGIN,
} from "./shared/index";

interface Props {
  header: string;
  subheader?: boolean | undefined;
  children: React.ReactNode;
  image?: string;
}

const SnapshotPage: React.FC<Props> = ({
  header,
  subheader,
  children,
  image,
}) => {
  return (
    <SnapshotPageContainer>
      <PageWidthContainer>
        <ImageContainer>
          <ImageLeft>{image && <Image src={image} />}</ImageLeft>
          <PageHeader>{header}</PageHeader>
        </ImageContainer>
        {subheader && (
          <PageSubheader>
            Weekly snapshot provided by <Emphasize>recidiviz</Emphasize>
          </PageSubheader>
        )}
      </PageWidthContainer>
      <Body>{children}</Body>
      <HorizontalRule />
      <PageWidthContainer>
        <LeftHeading>Log in to update data: model.recividiz.org</LeftHeading>
        <Right marginTop={TOP_BOTTOM_MARGIN}>
          Questions and feedback: covid@recidiviz.org
        </Right>
      </PageWidthContainer>
      <HorizontalRule />
    </SnapshotPageContainer>
  );
};

export default SnapshotPage;
