import {
  League,
  SimCBB,
  SimCFB,
  SimCHL,
  SimNBA,
  SimNFL,
  SimPHL,
} from "../_constants/constants";

// 🔥 Custom Error for API Calls
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// ✅ POST Request with Type Safety (Simplified)
export const PostCall = async <TRequest, TResponse>(
  url: string,
  dto: TRequest
): Promise<TResponse> => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      throw new ApiError(response.status, `HTTP Error: ${response.statusText}`);
    }

    const data = (await response.json()) as TResponse;
    return data;
  } catch (error) {
    console.error(`POST request failed for URL: ${url}`, error);
    throw error; // Rethrow to handle where the call is made
  }
};

export const PUTCall = async <TRequest, TResponse>(
  url: string,
  dto: TRequest
): Promise<TResponse> => {
  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      throw new ApiError(response.status, `HTTP Error: ${response.statusText}`);
    }

    const data = (await response.json()) as TResponse;
    return data;
  } catch (error) {
    console.error(`POST request failed for URL: ${url}`, error);
    throw error; // Rethrow to handle where the call is made
  }
};

// ✅ PUT Request without JSON Response (for void endpoints)
export const PUTCallNoResponse = async (url: string, dto: any): Promise<void> => {
  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      throw new ApiError(response.status, `HTTP Error: ${response.statusText}`);
    }

  } catch (error) {
    console.error(`PUT request failed for URL: ${url}`, error);
    throw error; // Rethrow to handle where the call is made
  }
};

// ✅ POST Request without JSON Response (for void endpoints)
export const PostCallNoResponse = async (url: string, dto: any): Promise<void> => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      throw new ApiError(response.status, `HTTP Error: ${response.statusText}`);
    }

  } catch (error) {
    console.error(`POST request failed for URL: ${url}`, error);
    throw error; // Rethrow to handle where the call is made
  }
};

// ✅ GET Request with JSON Response
export const GetCall = async <T,>(url: string): Promise<T> => {
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new ApiError(response.status, `HTTP Error: ${response.statusText}`);
    }

    const data = (await response.json()) as T;
    return data;
  } catch (error) {
    console.error(`Fetch failed for URL: ${url}`, error);
    throw error; // Rethrow to handle the error where the call is made
  }
};

export const GetActionCall = async (url: string): Promise<Response | false> => {
  const response = await fetch(url, {
    headers: {
      authorization: "Bearer " + localStorage.getItem("token"),
    },
    method: "GET",
  });

  if (!response.ok) {
    console.error("HTTP-Error:", response.status);
    return false;
  }

  return response;
};

type ResponseType = "json" | "blob";

/**
 * A single helper for both JSON calls and file‐downloads.
 *
 * @param url            The endpoint to call
 * @param responseType   "json" to parse JSON, "blob" to download a file
 * @returns              If "json", returns the parsed JSON as T;
 *                       if "blob", kicks off a download in the browser
 *                       and returns the Blob (in case you want to do more).
 */
export async function GetExportCall<T>(
  url: string,
  responseType: ResponseType = "json"
): Promise<T | Blob> {
  const token = localStorage.getItem("token");
  const response = await fetch(url, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      // you can hint to the server what you want:
      ...(responseType === "blob"
        ? { Accept: "application/zip, text/csv" }
        : { Accept: "application/json" }),
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, `HTTP Error: ${response.statusText}`);
  }

  if (responseType === "json") {
    // Generic JSON GET
    return (await response.json()) as T;
  }

  // Otherwise, we expect a file download
  const blob = await response.blob();

  // Try to get filename from Content-Disposition header
  let filename = url.split("/").pop() || "download";
  const cd = response.headers.get("Content-Disposition");
  if (cd) {
    const match = /filename="?([^"]+)"?/.exec(cd);
    if (match?.[1]) {
      filename = match[1];
    }
  }

  // Create a temporary <a> to trigger the download
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);

  return blob;
}

export const GetLeagueAbbr = (league: League): string => {
  switch (league) {
    case SimCFB:
      return "cfb";
    case SimNFL:
      return "nfl";
    case SimCBB:
      return "cbb";
    case SimNBA:
      return "nba";
    case SimCHL:
      return "chl";
    case SimPHL:
      return "phl";
    default:
      return "";
  }
};

export const GetSportAbbr = (league: League): string => {
  switch (league) {
    case SimCFB:
    case SimNFL:
      return "fba";
    case SimCBB:
    case SimNBA:
      return "bba";
    case SimCHL:
    case SimPHL:
      return "hck";
    default:
      return "";
  }
};
