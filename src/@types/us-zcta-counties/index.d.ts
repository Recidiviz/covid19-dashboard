declare module "us-zcta-counties" {
  export function getStates(): string[];
  export function getCountiesByState(state: string): string[];
}
