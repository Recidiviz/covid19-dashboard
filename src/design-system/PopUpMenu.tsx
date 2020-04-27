import hexAlpha from "hex-alpha";
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
  font-size: 24px;
  font-weight: 600;
  color: ${Colors.forest};
  padding: 8px;
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
  const clickItem = () => {
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
