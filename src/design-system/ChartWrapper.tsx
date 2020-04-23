import styled from "styled-components";

const ChartWrapper = styled.div`
  .frame {
    font-family: "Poppins", sans-serif;
    font-size: 11px;
    font-weight: 300;
    letter-spacing: 0;
  }

  .axis-baseline,
  .tick {
    stroke: #467472;
  }

  .tick {
    stroke-opacity: 0.2;
  }

  .axis-baseline {
    stroke-width: 2px;
  }

  .axis-title text,
  .axis-label {
    fill: #00413e;
    font-weight: 400;
    opacity: 0.7;
  }

  .axis-label {
    font-size: 10px;
  }
`;

export default ChartWrapper;
