import hexAlpha from "hex-alpha";
import React from "react";
import styled from "styled-components";

import UseComponentToggleVisible from "../hooks/UseComponentToggleVisible";
import Colors, { darken } from "./Colors";

interface Item {
  name: string;
  onClick: Function;
}

interface MenuProps {
  items: Item[];
}

interface ItemProps {
  item: Item;
}

const PopUpMenuDiv = styled.div`
  position: relative;
  cursor: pointer;
`;

const PopUpMenuIcon = styled.div`
  font-family: "Rubik", sans-serif;
  font-size: 24px;
  font-weight: 600;
  padding: 8px;
`;

const PopUpMenuContents = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: ${darken(Colors.white, 5)};
  min-width: 100px;
`;

const PopUpMenuItemDiv = styled.div`
  padding: 8px;
  &:hover {
    background-color: ${hexAlpha(Colors.teal, 0.1)};
  }
`;

const PopUpMenuItem: React.FC<ItemProps> = ({ item }) => {
  const clickItem = () => {
    item.onClick();
  };
  return <PopUpMenuItemDiv onClick={clickItem}>{item.name}</PopUpMenuItemDiv>;
};

const PopUpMenu: React.FC<MenuProps> = ({ items }) => {
  const {
    ref,
    isComponentVisible,
    setIsComponentVisible,
  } = UseComponentToggleVisible(false);

  const toggleMenu = () => {
    setIsComponentVisible(!isComponentVisible);
  };
  return (
    <PopUpMenuDiv ref={ref}>
      <PopUpMenuIcon onClick={toggleMenu}>•••</PopUpMenuIcon>
      {isComponentVisible && (
        <PopUpMenuContents>
          {items.map((item) => (
            <PopUpMenuItem item={item} key={`menu-${item.name}`} />
          ))}
        </PopUpMenuContents>
      )}
    </PopUpMenuDiv>
  );
};

export default PopUpMenu;
