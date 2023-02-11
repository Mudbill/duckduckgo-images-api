import axios from "axios";
import constants from "./constants";
import { sleep, getToken } from "./utils";

const { url, headers, max_iter, max_retries } = constants;

export interface DuckDuckGoImage {
  height: number;
  image: string;
  source: string;
  thumbnail: string;
  title: string;
  url: string;
  width: number;
}

async function image_search({
  query,
  moderate = false,
  retries = max_retries,
  iterations = max_iter,
}: {
  query: string;
  moderate?: boolean;
  retries?: number;
  iterations?: number;
}) {
  let reqUrl = url + "i.js";

  let results: DuckDuckGoImage[] = [];

  try {
    const token = await getToken(query);

    const params = {
      l: "wt-wt",
      o: "json",
      q: query,
      vqd: token,
      f: ",,,",
      p: moderate ? "1" : "-1", // by default moderate false
    };

    let data: { results: DuckDuckGoImage[]; next: string } | null = null;
    let itr = 0;

    while (itr < iterations) {
      let attempt = 0;
      while (true) {
        try {
          let response = await axios.get<{
            results: DuckDuckGoImage[];
            next: string;
          }>(reqUrl, {
            params,
            headers,
          });

          data = response.data;
          if (!data.results) throw "No results";
          break;
        } catch (error) {
          attempt += 1;
          if (attempt > retries) {
            return new Promise<DuckDuckGoImage[]>((resolve) => {
              resolve(results);
            });
          }
          await sleep(5000);
          continue;
        }
      }

      results.push(...data.results);

      if (!data.next) {
        return new Promise<DuckDuckGoImage[]>((resolve) => {
          resolve(results);
        });
      }

      reqUrl = url + data.next;
      itr += 1;
    }
  } catch (error) {}

  return results;
}

async function* image_search_generator({
  query,
  moderate,
  retries,
  iterations,
}: {
  query: string;
  moderate?: boolean;
  retries?: number;
  iterations?: number;
}) {
  let reqUrl = url + "i.js";
  let keywords = query;
  let p = moderate ? 1 : -1; // by default moderate false
  let attempt = 0;
  if (!retries) retries = max_retries; // default to max if none provided
  if (!iterations) iterations = max_iter; // default to max if none provided

  try {
    let token = await getToken(keywords);

    let params = {
      l: "wt-wt",
      o: "json",
      q: keywords,
      vqd: token,
      f: ",,,",
      p: "" + p,
    };

    let itr = 0;

    while (itr < iterations) {
      let data: { results: DuckDuckGoImage[]; next: string };

      while (true) {
        try {
          let response = await axios.get<{
            results: DuckDuckGoImage[];
            next: string;
          }>(reqUrl, {
            params,
            headers,
          });

          data = response.data;
          if (!data?.results) throw "No results";
          break;
        } catch (error) {
          console.error(error);
          attempt += 1;
          if (attempt > retries) {
            yield await new Promise<DuckDuckGoImage[]>((resolve, reject) => {
              reject("attempt finished");
            });
          }
          await sleep(5000);
          continue;
        }
      }

      yield await new Promise<DuckDuckGoImage[]>((resolve, reject) => {
        resolve(data.results);
      });

      reqUrl = url + data["next"];
      itr += 1;
      attempt = 0;
    }
  } catch (error) {
    console.error(error);
  }
}

export { image_search, image_search_generator };
