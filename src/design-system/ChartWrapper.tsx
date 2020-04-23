import styled from "styled-components";

import Colors from "./Colors";

const ChartWrapper = styled.div`
  .frame {
    font-family: "Poppins", sans-serif;
    font-size: 11px;
    font-weight: 300;
    letter-spacing: 0;
  }

  .tick {
    stroke: ${Colors.paleForest};
    stroke-opacity: 0.2;
  }

  .axis-baseline {
    stroke: ${Colors.paleForest};
    stroke-width: 2px;
  }

  .axis-title text,
  .axis-label {
    fill: ${Colors.paleForest};
    font-weight: 400;
  }

  .axis-label {
    font-size: 10px;
  }
`;

export default ChartWrapper;
