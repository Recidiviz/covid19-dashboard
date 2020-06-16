declare module "us-zcta-counties" {
  export function getStates(): string[];
  export function getCountiesByState(stateName: string): string[];
}
