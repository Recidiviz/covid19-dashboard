// Date Format Constants
export const MMMD = "MMM d";
export const MMMMdyyyy = "MMMM d, yyyy";
export const STATE_PRISON = "State Prison";

export const CLOUD_FUNCTION_URL_BASE =
  process.env.GATSBY_USE_LOCAL_CLOUD_FUNCTIONS === "true"
    ? "http://localhost:5001/c19-backend/us-central1"
    : "https://us-central1-c19-backend.cloudfunctions.net";
