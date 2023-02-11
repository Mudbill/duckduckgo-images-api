import axios from "axios";
import constants from "./constants";

const { url } = constants;

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function getToken(keywords: string) {
  let token: string;
  let error: unknown;

  try {
    let res = await axios.get<string>(url, {
      params: {
        q: keywords,
      },
    });

    token = res.data.match(/vqd=([\d-]+)\&/)?.[1] || "";
  } catch (e) {
    error = e;
  }

  return new Promise<string>((resolve, reject) => {
    if (!token) reject(error);
    resolve(token);
  });
}

export { sleep, getToken };
