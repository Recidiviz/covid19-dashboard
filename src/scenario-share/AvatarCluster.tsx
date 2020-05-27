import React from "react";
import styled from "styled-components";

import { ScenarioUsers } from "../page-multi-facility/types";
import UserAvatar from "./UserAvatar";

const AvatarClusterContainer = styled.div`
  display: flex;
`;

const AvatarWrapper = styled.div`
  flex: 0 0 auto;
  margin-right: -4px;
  overflow: visible;
`;

const avatarsToShow = 4;

const LeftoverWrapper = styled.div`
  flex: 0 0 auto;
  z-index: ${-avatarsToShow};
`;

const AvatarCluster: React.FC<{ users: ScenarioUsers | null }> = ({
  users,
}) => {
  if (!users) return null;

  const usersToShow = users.viewers.slice(0, avatarsToShow);
  const leftoverUsers = users.viewers.length - avatarsToShow;
  return (
    <AvatarClusterContainer>
      {usersToShow.map((user, index) => (
        <AvatarWrapper key={user.id} style={{ zIndex: -index }}>
          <UserAvatar user={user} />
        </AvatarWrapper>
      ))}
      {leftoverUsers > 0 && (
        <LeftoverWrapper>
          <UserAvatar text={`+${leftoverUsers}`} />
        </LeftoverWrapper>
      )}
    </AvatarClusterContainer>
  );
};

export default AvatarCluster;
