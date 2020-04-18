import { FiMoreHorizontal } from "react-icons/fi";
import styled from "styled-components";

const LibraryPageDiv = styled.div`
  /* Dropdown Content div */
  .dropdown {
    display: flex;
    position: relative;
    margin-top: 10px;
  }

  .dropdown-Icon {
    width: 24px;
    height: 24px;
  }

  /* Dropdown Content */
  .dropdown-content {
    display: none;
    position: absolute;
    background-color: #005450;
    min-width: 130px;
    box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    z-index: 1;
  }

  /* Links inside the dropdown */
  .dropdown-content a {
    color: white;
    font-family: Rubik;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    text-align: center;
    line-height: 26px;
    opacity: 0.8;
    padding: 8px 6px;
    display: block;
  }

  /* Change color of dropdown links on hover */
  .dropdown-content a:hover {
    background-color: #00a8a0;
    border-radius: 5px;
  }

  /* Show the dropdown menu on hover */
  .dropdown:hover .dropdown-content {
    display: block;
  }
`;
const DropdownList: React.FC = () => {
  return (
    <LibraryPageDiv>
      <div className="dropdown">
        <button className="dropbtn">
          <FiMoreHorizontal className="dropdown-Icon" />
        </button>
        <div className="dropdown-content">
          <a href="#">Duplicate</a>
          <a href="#">Delete</a>
          <a href="#">Rename</a>
        </div>
      </div>
    </LibraryPageDiv>
  );
};

export default DropdownList;
