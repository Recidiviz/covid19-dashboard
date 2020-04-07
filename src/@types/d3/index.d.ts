import { DSVRowAny, DSVRowString } from "d3";

declare module "d3" {
  // @types/d3 is somewhat outdated, patch it
  // with missing members here as needed
  export function autoType(obj: DSVRowString): DSVRowAny;
  export function autoType(obj: string[]): any[];
}

declare module "d3-array" {
  export function rollup<DSVRowAny, any, object>(
    a: Iterable<DSVRowAny>,
    reduce: (value: DSVRowAny[]) => object,
    ...keys: function[]
  ): // this declaration is fudged;
  // the amount of Map nesting should reflect the number of keys.
  // in the main @types package there is only support for passing a single key
  // which does not correspond to what the function actually supports
  Map<any, object | Map<string, any[]>>;
}
