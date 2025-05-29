import { constants } from "./constants.js";
import { getToken, isResponseValid, sleep } from "./utils.js";

/**
 * A DuckDuckGo image search result
 */
export interface DuckDuckGoImage {
  /** Height of image in pixels */
  height: number;

  /** Width of image in pixels */
  width: number;

  /** Image URL */
  image: string;

  /** Where DuckDuckGo found the image */
  source: string;

  /** A smaller thumbnail of the image */
  thumbnail: string;

  /** The title associated with the image (such as web page) */
  title: string;

  /** URL of web page where image was found */
  url: string;
}

export interface ImageSearchOptions {
  /** The search query */
  query: string;
  /** Whether to use safe search or not (default true) */
  safe?: boolean;
  /** How many retries to attempt if a request fails (default 2) */
  retries?: number;
  /** How many iterations to run through for images (default 1). Each iteration contains up to 100 results. */
  iterations?: number;
}

/**
 * Search DuckDuckGo for images
 */
export async function imageSearch(
  /** Options for the search request */
  options: ImageSearchOptions
): Promise<DuckDuckGoImage[]> {
  const results: DuckDuckGoImage[] = [];
  for await (const resultSet of imageSearchGenerator(options)) {
    results.push(...resultSet);
  }
  return results;
}

/**
 * Search DuckDuckGo for images with a generator function.
 */
export async function* imageSearchGenerator(
  options: ImageSearchOptions
): AsyncGenerator<DuckDuckGoImage[], void, unknown> {
  // Set up config
  const config = {
    safe: options.safe ?? true,
    retries: options.retries ?? constants.maxRetries,
    iterations: options.iterations ?? constants.maxIterations,
  };

  // Set up request details
  const token = await getToken(options.query);
  const headers = constants.headers;
  const params = new URLSearchParams({
    o: "json",
    q: options.query,
    l: "us-en",
    vqd: token,
    p: config.safe ? "1" : "-1",
  });
  let url = new URL(`i.js?${params.toString()}`, constants.baseUrl);

  // Count each iteration to make
  let iter = 0;
  while (iter < config.iterations) {
    iter++;

    // Count each failed attempt for retries
    let attempts = 0;
    while (attempts < config.retries) {
      attempts++;

      try {
        const response = await fetch(url, { headers });

        // Fall back to catch block if response is not okay
        if (!response.ok) {
          throw new Error("Response was no good");
        }

        // Get JSON body
        const body = (await response.json()) as unknown;

        // Validate the JSON body
        if (isResponseValid(body)) {
          // Update URL for the next iteration and re-set the token (which is not included)
          url = new URL(body.next, constants.baseUrl);
          url.searchParams.set("vqd", token);

          // Yield back the current results and close the attempt loop
          yield body.results;
          break;
        } else {
          throw new Error(
            "Unexpected response payload, perhaps the DDG service has changed?"
          );
        }
      } catch (error) {
        // Wait 1 second and try again (if more attempts are allowed)
        await sleep(1000);
        continue;
      }
    }
  }
}
