import React from "react";
import styled from "styled-components";

import Colors from "../design-system/Colors";
import { User } from "../page-multi-facility/types";

const bubbleSize = 32;
const UserInitialImg = styled.img`
  border: 1px solid ${Colors.slate};
  border-radius: ${bubbleSize / 2}px;
  display: inline-block;
  height: ${bubbleSize}px;
  width: ${bubbleSize}px;
`;

const TextAvatar = styled(UserInitialImg)`
  align-items: center;
  background: #d7dbdb;
  color: ${Colors.forest};
  display: flex;
  font-family: "Poppins", sans-serif;
  font-size: 10px;
  font-weight: normal;
  justify-content: center;
  overflow: hidden;
  padding: ${bubbleSize / 8}px;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const UserAvatar: React.FC<{ text?: string; user?: User }> = ({
  text,
  user,
}) => {
  return user ? (
    <UserInitialImg
      alt=""
      src={`https://cdn.auth0.com/avatars/${user.name
        .charAt(0)
        .toLowerCase()}.png?ssl=1`}
    />
  ) : text ? (
    <TextAvatar as="div">{text}</TextAvatar>
  ) : null;
};

export default UserAvatar;
