import type { DuckDuckGoImage } from "./api.js";
import { constants } from "./constants.js";

export interface ExpectedResponse {
  results: DuckDuckGoImage[];
  next: string;
}

/**
 * Validate response shape
 */
export function isResponseValid(data: any): data is ExpectedResponse {
  if (!data) return false;
  if (typeof data !== "object") return false;

  const { results } = data;
  if (results && typeof results !== "object") return false;

  if (!Array.isArray(results)) return false;

  for (const r of results) {
    const result = r as ExpectedResponse["results"][number];
    if (typeof result.height !== "number") return false;
    if (typeof result.width !== "number") return false;
    if (typeof result.image !== "string") return false;
    if (typeof result.source !== "string") return false;
    if (typeof result.thumbnail !== "string") return false;
    if (typeof result.title !== "string") return false;
    if (typeof result.url !== "string") return false;
  }

  return true;
}

/**
 * Do a regular query to get a temporary session token used in image searches
 */
export async function getToken(query: string) {
  const params = new URLSearchParams({
    q: query,
  });

  const res = await fetch(`${constants.baseUrl}?${params.toString()}`);

  if (!res.ok) {
    throw new Error("Failed to contact website", { cause: res });
  }

  // Scan the text output for a token in the vqd field
  const text = await res.text();
  const token = text.match(/vqd=([\d-]+)\&/)?.[1] || "";

  if (!token) {
    throw new Error("Failed to get token");
  }

  return token;
}

export function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
