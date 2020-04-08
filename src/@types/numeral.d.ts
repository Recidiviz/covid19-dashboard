interface Numeral {
  // numeral returns null here if it can't parse the input string,
  // but @types doesn't reflect that
  value(): number | null;
}

declare const numeral: Numeral;

declare module "numeral" {
  export = numeral;
}
