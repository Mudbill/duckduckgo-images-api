import { image_search, image_search_generator } from "../src/api";

function print(results: any) {
  results.forEach((element: unknown) => {
    console.log(element);
  });
}

//image search completes all iterations and returns the complete results at once
image_search({ query: "naruto", moderate: true }).then((results) =>
  print(results)
);

//image search genrator returns result of each iteration useful for large no of iterations
async function main() {
  for await (let resultSet of image_search_generator({
    query: "naruto",
    moderate: true,
    iterations: 4,
  })) {
    print(resultSet);
  }
}

main().catch(console.log);
