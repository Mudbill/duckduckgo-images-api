# duckduckgo-images-api

Note: This package is forked from [KshitijMhatre](https://github.com/KshitijMhatre/duckduckgo-images-api) as it looks like the original project has been abandoned.

A lightweight Node package to programmatically obtain image search results from DuckDuckGo search engine.

The method used is inspired from [python package](https://github.com/deepanprabhu/duckduckgo-images-api) with same name. Thanks to [deepanprabhu](https://github.com/deepanprabhu) for original source.

## Usage

To install, run:

```
npm install @mudbill/duckduckgo-images-api
```

TypeScript definitions are included as well.

The package provides a simple async API, and uses the following config object as input:

```ts
type SearchOptions = {
  // The search term (required)
  query: string,

  // Whether to use safe search moderation (optional, default false)
  moderate?: boolean,

  // Number of result sets fetched (optional, default 2)
  iterations?: number,

  // Number of retries per iteration (optional, default 2)
  retries?: number,
}
```

The `image_search` function returns a Promise that resolves to an array of complete results.

```ts
image_search({ query: "birds", moderate: true }).then((results) =>
  console.log(results)
);
```

The `image_search_generator` function is an async generator that yield a Promise of result sets on each iteration. Useful for large iterations. Please check the Node version compatability for this syntax.

```ts
async function main() {
  for await (let resultSet of image_search_generator({
    query: "birds",
    moderate: true,
    iterations: 4,
  })) {
    console.log(resultSet);
  }
}

main().catch(console.log);
```

Please feel free to report any issues or feature requests.

### Note

DuckDuckGo provides an instant answer API. This package does not use this route. This package mocks the browser behaviour using the same request format. Use it wisely.
