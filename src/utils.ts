import axios from "axios";
import constants from "./constants";

const { url } = constants;

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function getToken(keywords: string) {
  let token: string | null = null;
  try {
    let res = await axios.get(url, {
      params: {
        q: keywords,
      },
    });

    token = res.data.match(/vqd=([\d-]+)\&/)[1];
  } catch (error) {
    console.error(error);
  }

  return new Promise((resolve, reject) => {
    if (!token) reject("Failed to get token");
    resolve(token);
  });
}

export { sleep, getToken };
