import React from "react";
import styled from "styled-components";

import UseComponentToggleVisible from "../hooks/UseComponentToggleVisible";
import Colors from "./Colors";

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
  height: min-content;
`;

const PopUpMenuIcon = styled.div`
  font-family: "Rubik", sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: ${Colors.forest};
`;

const PopUpMenuContents = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: ${Colors.forest};
  color: ${Colors.white};
  border-radius: 4px;
  min-width: 105px;
  font-family: "PingFang SC", sans-serif;
  font-size: 14px;
  line-height: 26px;
  font-weight: normal;
  padding: 8px 16px;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
`;

const PopUpMenuItem: React.FC<ItemProps> = ({ item }) => {
  const clickItem = (event: React.MouseEvent<Element>) => {
    // If the PopUpMenuItem is embedded within an element that is
    // clickable (i.e. a Scenario Library Card) we need to prevent
    // that parent element's click action from firing so that we
    // allow the menu item's click action to execute uninterrupted.
    event.stopPropagation();
    item.onClick();
  };
  return <div onClick={clickItem}>{item.name}</div>;
};

const PopUpMenu: React.FC<MenuProps> = ({ items }) => {
  const {
    ref,
    isComponentVisible,
    setIsComponentVisible,
  } = UseComponentToggleVisible(false);

  const toggleMenu = (event: React.MouseEvent<Element>) => {
    // If the PopUpMenu is embedded within an element that is clickable
    // (i.e. a Scenario Library Card) we need to prevent that parent
    // element's click action from firing so that we can display the
    // menu items
    event.stopPropagation();
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
