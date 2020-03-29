function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

const Slider = function(metric) {
  const colorName = metric === "infected" ? "red" : "teal"; // tailwind css colors
  const flip = metric === "incarcerated";
  const targetSelector = "#" + metric + "_slider";

  const width = $(targetSelector).width();

  const arcRadius = width / 2;
  const arcThickness = 2;
  const height = arcRadius;
  const horizonOffsetDegrees = 9;

  let startAngle,
    endAngle,
    offsetStyle = {
      value: -($("#map_and_text_container").height() / 2) + "px"
    };
  if (flip) {
    startAngle = degreesToRadians(90 + horizonOffsetDegrees);
    endAngle = degreesToRadians(270 - horizonOffsetDegrees);
    containerTransform = "translate(" + width / 2 + ", 0)";
    offsetStyle.property = "margin-top";
  } else {
    startAngle = degreesToRadians(-90 + horizonOffsetDegrees);
    endAngle = degreesToRadians(90 - horizonOffsetDegrees);
    containerTransform = "translate(" + width / 2 + "," + arcRadius + ")";
    offsetStyle.property = "margin-bottom";
  }

  const baseArcGenerator = d3
    .arc()
    .startAngle(startAngle)
    .endAngle(endAngle)
    .innerRadius(arcRadius - arcThickness)
    .outerRadius(arcRadius);

  const targetEl = d3
    .select(targetSelector)
    .style(offsetStyle.property, offsetStyle.value);

  const container = targetEl
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", containerTransform);

  const baseArc = container
    .append("path")
    .attr("d", baseArcGenerator())
    .attr("class", "fill-current text-" + colorName + "-200");

  // draw the value arc
  const arcScale = d3
    .scaleLinear()
    .range([startAngle, endAngle])
    .clamp(true);

  function getSliderValue() {
    return metric === "infected"
      ? appState.percentageInfected
      : appState.incarceratedPopulation;
  }

  const valueArcGenerator = d3
    .arc()
    .innerRadius(arcRadius - arcThickness)
    .outerRadius(arcRadius);

  if (flip) {
    // we are drawing the arc "backwards" (clockwise)
    // so vary the start angle to make slider move LtR
    valueArcGenerator.endAngle(endAngle);
  } else {
    valueArcGenerator.startAngle(startAngle);
  }

  function getValuePath(val) {
    // TODO: maybe don't have to do this on every repaint
    // but for now they are coupled
    if (metric === "infected") {
      arcScale.domain([0, 100]);
    } else {
      // these numbers are reversed because we are drawing the arc "backwards"
      arcScale.domain([
        appState.incarceratedPopulationMax,
        appState.incarceratedPopulationMin
      ]);
    }
    if (flip) {
      return valueArcGenerator({ startAngle: arcScale(val) });
    } else {
      return valueArcGenerator({ endAngle: arcScale(val) });
    }
  }

  const valueArc = container.append("g");
  this.updateValue = function() {
    valueArc
      .selectAll("path")
      .data([getSliderValue()])
      .join("path")
      .attr("class", "fill-current text-" + colorName + "-600")
      .attr("d", getValuePath);
  };

  this.updateValue();
};
