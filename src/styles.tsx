import styled, { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  body {
    font-family: 'Poppins', sans-serif;
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 16px;
    letter-spacing: -0.05em;
    margin: 0px;
    color: #00413E;
    background-color: #e9ecec;
  }

  h1 {
    font-family: 'Libre Baskerville', serif;
    font-style: normal;
    font-weight: normal;
    font-size: 64px;
    line-height: 64px;
    letter-spacing: -0.03em;
    color: #006C67;
  }

  h2 {
    font-family: 'Rubik', sans-serif;
    font-weight: 100;
    font-size: 24px;
    line-height: 1.7em;
    letter-spacing: -0.03em;
    color: #006C67;
  }

  p {
    font-family: 'Poppins', sans-serif;
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 16px;
    letter-spacing: -0.05em;
    color: #00413E;
  }

  .nav-link {
    font-family: 'Poppins', sans-serif;
    font-style: normal;
    font-weight: 600;
    font-size: 13px;
    line-height: 16px;
    text-align: right;
    letter-spacing: -0.05em;
    color: #006C67;
  }

  .tooltip {
    font-family: 'Rubik', sans-serif;
    font-family: Rubik;
    font-style: normal;
    font-weight: normal;
    font-size: 12px;
    line-height: 16px;
    display: flex;
    align-items: center;
    text-align: center;
    color: #FFFFFF;
    opacity: 0.8;
    background: #005450;
    box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    padding: 8px;
  }

  .metric {
    font-family: 'Poppins', sans-serif;
    font-style: normal;
    font-weight: 600;
    font-size: 24px;
    line-height: 24px;
    color: #DE5558;
  }

  .description {
    font-family: 'Rubik', sans-serif;
    font-style: normal;
    font-weight: normal;
    font-size: 12px;
    line-height: 16px;
    color: #00413E;
    opacity: 0.8;
  }

  .ic-facts {
    width: 24px;
    height: 24px;
  }

  .ic-share {
    width: 14px;
    height: 14x;
  }

  .logo {
    width: 137px;
    height: 10px;
  }

  .tint1 {
    background: #EAECEC;
  }

  .font-display {
    font-family: "Poppins", sans-serif;
  }

  .font-body {
    font-family: "Rubik", sans-serif;
  }

  .font-7xl {
    font-size: 6rem;
  }

  .text-green {
    color: #00413e;
  }

  .border-green {
    border-color: #00413e;
  }

  .text-green-light {
    color: #25b895;
  }

  .text-teal {
    color: #006c67;
  }

  .text-teal-light {
    color: #a7d1de;
  }

  .text-red {
    color: #de5558;
  }

  .text-red-light {
    color: #efb5b7;
  }

  .border-current {
    border-color: currentColor;
  }

  .w-28 {
    width: 6.5rem;
  }

  p,
  ol {
    letter-spacing: 0;
    font-family: "Rubik", sans-serif;
    line-height: 1.5;
    font-weight: normal;
  }

  .toast-success {
    padding: 16px;
    background: white;
    display: flex;
    position: absolute;
    bottom: 16px;
    right: 16px;
  }

  .toast-success button, .toast-warn button {
    margin-left: 8px;
  }
`;

export const ContainerTint1 = styled.div`
  min-width: 100vw;
  min-height: 100vh;
  padding: 24px;
  background: #eaecec;
  box-sizing: border-box;
`;
