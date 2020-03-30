import { getStateName } from "./data-forms";

export default function initTooltips() {
  const $tooltip = $("#map_tooltip");

  $("#us_map .state")
    .mousemove(function (event) {
      $tooltip
        .html(getStateName(event.target.id))
        .css({
          left: event.pageX + 15,
          top: event.pageY + 15,
        })
        .removeClass("hidden");
    })
    .mouseout(function () {
      $tooltip.html("").addClass("hidden");
    });
}
