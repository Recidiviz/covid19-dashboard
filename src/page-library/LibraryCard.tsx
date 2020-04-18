import styled from "styled-components";

import DropdownList from "./DropdownList";

const MenuCard = styled.div`
  position: absolute;
  display: flex;
  width: 500px;
  height: 500px;
  right: 100px;
  top: 120px;
  border: 1px solid #c5cece;
  box-sizing: border-box;
  border-radius: 4px;
  margin: 30px;

  .MenuIcon-position {
    position: absolute;
    left: 90%;
    bottom: 5%;
  }
`;

const LibraryCard: React.FC = () => {
  return (
    <MenuCard>
      <div className="MenuIcon-position">
        <DropdownList />
      </div>
    </MenuCard>
  );
};

export default LibraryCard;
