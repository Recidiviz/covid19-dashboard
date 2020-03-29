function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

const Slider = function(metric) {
  const colorName = metric === "infected" ? "red" : "teal"; // tailwind css colors
  const baseColorIntensity = 200;
  const valueColorIntensity = 600;
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

  // ----------------------------------
  // draw the base arc
  // ----------------------------------
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
    .attr("class", "overflow-visible")
    .append("g")
    .attr("transform", containerTransform);

  const baseArc = container
    .append("path")
    .attr("d", baseArcGenerator())
    .attr("class", "fill-current text-" + colorName + "-" + baseColorIntensity);

  // ----------------------------------
  // draw the value arc
  // ----------------------------------
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

  function updateArcScale() {
    if (metric === "infected") {
      arcScale.domain([0, 100]);
    } else {
      // these numbers are reversed because we are drawing the arc "backwards"
      arcScale.domain([
        appState.incarceratedPopulationMax,
        appState.incarceratedPopulationMin
      ]);
    }
  }

  function getValuePath(val) {
    // TODO: maybe don't have to do this on every repaint
    // but for now they are coupled
    updateArcScale();

    if (flip) {
      return valueArcGenerator({ startAngle: arcScale(val) });
    } else {
      return valueArcGenerator({ endAngle: arcScale(val) });
    }
  }

  const valueArc = container.append("g");

  function drawValueArc() {
    valueArc
      .selectAll("path")
      .data([getSliderValue()])
      .join("path")
      .attr(
        "class",
        "fill-current text-" + colorName + "-" + valueColorIntensity
      )
      .attr("d", getValuePath);
  }

  // ----------------------------------
  // draw handle
  // ----------------------------------
  // (x, y) = (r * cos(angle), r * sin(angle).
  function getHandleCoordinates(val) {
    // TODO: would be nice if we could just assume this was always up to date?
    updateArcScale();
    // these measurements are all off by 90 degrees because d3 draws arcs
    // starting at 12 o'clock but JavaScript doesn't?
    const angleOffset = -degreesToRadians(90);
    // we want the dot to be centered on the arc
    const radiusToDot = arcRadius - arcThickness / 2;
    return {
      x: radiusToDot * Math.cos(arcScale(val) + angleOffset),
      y: radiusToDot * Math.sin(arcScale(val) + angleOffset)
    };
  }
  const valueHandle = container.append("g");

  function drawValueHandle() {
    valueHandle
      .selectAll("circle")
      .data([getSliderValue()])
      .join("circle")
      .attr(
        "class",
        "fill-current text-" + colorName + "-" + valueColorIntensity
      )
      .attr("r", 10)
      .attr("cx", function(d) {
        return getHandleCoordinates(d).x;
      })
      .attr("cy", function(d) {
        return getHandleCoordinates(d).y;
      });
  }

  this.updateValue = function() {
    drawValueArc();
    drawValueHandle();
  };

  this.updateValue();
};
