import { appState, updateAppState } from "./data-forms";

function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

export const Slider = function (metric) {
  const colorName = metric === "R0" ? "red" : "teal"; // tailwind css colors
  const flip = metric === "incarcerated";
  const targetSelector = "#" + metric + "_slider";

  const width = $(targetSelector).width();

  const arcRadius = width / 2;
  const arcThickness = 2;
  const height = arcRadius;
  const horizonOffsetDegrees = 9;

  let containerTransform;
  let startAngle,
    endAngle,
    offsetStyle = {
      value: -($("#map_and_text_container").height() / 2) + "px",
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
    .attr("class", "fill-current text-" + colorName + "-light");

  // ----------------------------------
  // draw the value arc
  // ----------------------------------
  const arcScale = d3.scaleLinear().range([startAngle, endAngle]).clamp(true);

  function getSliderValue() {
    return metric === "R0" ? appState.R0 : appState.incarceratedPopulation;
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
    if (metric === "R0") {
      arcScale.domain([appState.R0Min, appState.R0Max]);
    } else {
      // these numbers are reversed because we are drawing the arc "backwards"
      arcScale.domain([
        appState.incarceratedPopulationMax,
        appState.incarceratedPopulationMin,
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
      .attr("class", "fill-current text-" + colorName)
      .attr("d", getValuePath);
  }

  // ----------------------------------
  // draw handle
  // ----------------------------------
  // (x, y) = (r * cos(angle), r * sin(angle).
  function setNewValue(val) {
    const update = {};
    if (metric === "R0") {
      update.R0 = val;
    } else {
      update.incarceratedPopulation = val;
    }
    updateAppState(update);
  }

  const radiusToDot = arcRadius - arcThickness / 2;
  function getHandleCoordinates(val) {
    // TODO: would be nice if we could just assume this was always up to date?
    updateArcScale();
    // these measurements are all off by 90 degrees because d3 draws arcs
    // starting at 12 o'clock but JavaScript doesn't?
    const angleOffset = -degreesToRadians(90);
    // we want the dot to be centered on the arc

    return {
      x: radiusToDot * Math.cos(arcScale(val) + angleOffset),
      y: radiusToDot * Math.sin(arcScale(val) + angleOffset),
    };
  }
  const valueHandle = container.append("g");

  const drag = d3.drag().on("drag", function dragged() {
    d3.event.sourceEvent.stopPropagation();
    const coordsRelativeToArc = d3.mouse(baseArc.node());
    let angleOfCoords = Math.atan2(
      coordsRelativeToArc[0],
      -coordsRelativeToArc[1],
    );
    // the angle flips to negative at the bottom of the circle;
    // I don't know why but I know I don't want it to happen,
    // so this fixes that
    if (flip && angleOfCoords < 0) {
      angleOfCoords = 2 * Math.PI + angleOfCoords;
    }

    setNewValue(arcScale.invert(angleOfCoords));
  });

  function drawValueHandle() {
    valueHandle
      .selectAll("circle")
      .data([getSliderValue()])
      .join("circle")
      .attr("class", "fill-current text-" + colorName)
      .attr("r", 10)
      .attr("cx", function (d) {
        return getHandleCoordinates(d).x;
      })
      .attr("cy", function (d) {
        return getHandleCoordinates(d).y;
      })
      .call(drag);
  }

  this.updateValue = function () {
    drawValueArc();
    drawValueHandle();
  };

  this.updateValue();
};
