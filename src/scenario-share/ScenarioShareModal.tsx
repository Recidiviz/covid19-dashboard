import { ascending } from "d3-array";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

import {
  addScenarioUser,
  getScenarioUsers,
  removeScenarioUser,
} from "../database";
import Colors from "../design-system/Colors";
import InputButton from "../design-system/InputButton";
import InputText from "../design-system/InputText";
import Loading from "../design-system/Loading";
import Modal from "../design-system/Modal";
import { Spacer } from "../design-system/Spacer";
import useCurrentUserId from "../hooks/useCurrentUserId";
import useReadOnlyMode from "../hooks/useReadOnlyMode";
import useRejectionToast from "../hooks/useRejectionToast";
import { ScenarioUsers } from "../page-multi-facility/types";
import useScenario from "../scenario-context/useScenario";
import AvatarCluster from "./AvatarCluster";
import ScenarioShareLink from "./ScenarioShareLink";
import UserAvatar from "./UserAvatar";

const ShareForm = styled.form`
  align-items: flex-end;
  display: flex;
  flex-direction: row;
`;

const buttonStyles: React.CSSProperties = {
  width: "78px",
  fontSize: "13px",
  fontWeight: "normal",
};

const UserListContainer = styled.ul`
  font-size: 13px;
  font-weight: normal;
  letter-spacing: -0.02em;
`;

const UserListItem = styled.li`
  align-items: center;
  display: flex;
  height: 32px;
  margin: 8px;
`;

const UserName = styled.div`
  margin-left: 16px;
`;

const RemoveButton = styled.button`
  color: ${Colors.darkRed};
  margin-left: auto;
`;

const UserList: React.FC<{
  users: ScenarioUsers;
  removeUser: (id: string) => void;
}> = ({ removeUser, users }) => {
  const [scenario] = useScenario();
  const readOnly = useReadOnlyMode(scenario.data);
  const rejectionToast = useRejectionToast();

  return (
    <UserListContainer>
      {users.owner && (
        <UserListItem>
          <UserAvatar user={users.owner} />
          <UserName>
            {users.owner.name}
            {!readOnly && " (You)"}
          </UserName>
        </UserListItem>
      )}
      {users.viewers.map((user) => (
        <UserListItem key={user.id}>
          <UserAvatar user={user} />
          <UserName>{user.name}</UserName>
          {scenario.data && !readOnly && (
            <RemoveButton
              onClick={() => {
                if (scenario.data) {
                  rejectionToast(
                    removeScenarioUser(scenario.data.id, user.id).then(() =>
                      removeUser(user.id),
                    ),
                  );
                }
              }}
            >
              Remove
            </RemoveButton>
          )}
        </UserListItem>
      ))}
    </UserListContainer>
  );
};

const ShareButton = styled.button`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const ScenarioShareModal: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [scenario] = useScenario();
  const [emailAddress, setEmailAddress] = useState<string | undefined>();
  const [users, setUsers] = useState<ScenarioUsers | null>(null);
  const currentUserId = useCurrentUserId();
  const rejectionToast = useRejectionToast();

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scenario.data && emailAddress) {
      rejectionToast(
        addScenarioUser(scenario.data.id, emailAddress).then((addedUser) => {
          if (users) {
            setUsers({
              owner: users.owner,
              viewers: [...users.viewers, addedUser].sort((a, b) =>
                ascending(a.name, b.name),
              ),
            });
            setEmailAddress(undefined);
          }
        }),
      );
    }
  };

  const removeUser = (id: string) => {
    if (users) {
      setUsers({
        owner: users.owner,
        viewers: users.viewers.filter((u) => u.id !== id),
      });
    }
  };

  useEffect(() => {
    let shouldUpdateState = true;
    async function getUserList() {
      if (scenario.data) {
        const scenarioUsers = await getScenarioUsers(scenario.data.id);
        // don't try to update state if this effect has already been cleaned up
        if (shouldUpdateState) {
          setUsers(scenarioUsers);
        }
      } else {
        setUsers(null);
      }
    }
    getUserList();

    return () => {
      // cleanup: prevent state updates from pending DB fetch
      shouldUpdateState = false;
    };
  }, [currentUserId, scenario.data]);

  return (
    <Modal
      modalTitle={`Share ${scenario.data?.name}`}
      open={modalOpen}
      setOpen={setModalOpen}
      trigger={
        <ShareButton>
          <ScenarioShareLink />
          <AvatarCluster users={users} />
        </ShareButton>
      }
      width="450px"
    >
      <Spacer y={30} />
      <ShareForm onSubmit={handleFormSubmit}>
        <InputText
          labelAbove="To:"
          onValueChange={setEmailAddress}
          labelPlaceholder="Email"
          required
          type="email"
          valueEntered={emailAddress}
        />
        <Spacer x={8} />
        <InputButton label="Invite" styles={buttonStyles} />
      </ShareForm>
      <Spacer y={24} />
      {users ? <UserList removeUser={removeUser} users={users} /> : <Loading />}
    </Modal>
  );
};

export default ScenarioShareModal;
