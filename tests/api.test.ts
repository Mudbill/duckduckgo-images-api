import { describe, expect, it } from "bun:test";
import { imageSearch, imageSearchGenerator } from "../src/api.js";

describe("duckduckgo api tests", () => {
  it("can fetch an image set", async () => {
    const results = await imageSearch({
      query: "potato",
    });
    expect(results).toBeArray();
    expect(results.length).toBe(100);
    expect(results[0].image).toBeString();
  });

  it("can fetch result sets with the generator", async () => {
    let runs = 0;
    for await (const resultSet of imageSearchGenerator({
      query: "naruto",
      iterations: 3,
    })) {
      runs++;
      expect(resultSet.length).toBe(100);
    }
    expect(runs).toBe(3);
  });
});
