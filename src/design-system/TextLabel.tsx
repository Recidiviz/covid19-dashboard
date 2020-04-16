import styled from "styled-components";

const TextLabel = styled.span<{ softened?: boolean }>`
  ${(props) => (props.softened ? "text-transform: uppercase;" : null)}
  font-size: 12px;
  font-weight: 100;
  font-family: "Poppins", sans-serif;
  ${(props) => (props.softened ? "letter-spacing: 2px;" : null)}
  color: #00413e;
  padding-right: 5px;
`;

export default TextLabel;
