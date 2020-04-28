type RawRecord = {
  date: number; // timestamp
  value: number;
};

type RawRtData = {
  Rt: RawRecord[];
  low90: RawRecord[];
  high90: RawRecord[];
};

type ErrorResponse = {
  error: string;
};

const isError = (obj: RawRtData | ErrorResponse): obj is ErrorResponse => {
  return (obj as ErrorResponse).error !== undefined;
};

const getFetchUrl = () => {
  let url = "https://us-central1-c19-backend.cloudfunctions.net/calculate_rt";
  if (process.env.NODE_ENV !== "production") {
    url += "_development";
  }

  return url;
};

export default async function fetchRt(requestData: {
  dates: number[];
  cases: number[];
}): Promise<RawRtData> {
  const resp = await fetch(getFetchUrl(), {
    body: JSON.stringify(requestData),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const responseData = await resp.json();

  if (isError(responseData)) {
    throw new Error(responseData.error);
  }
  return responseData;
}
