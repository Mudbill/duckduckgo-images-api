# duckduckgo-images-api

Based on [KshitijMhatre's version](https://github.com/KshitijMhatre/duckduckgo-images-api) as it has been unmaintained.

A lightweight library to programmatically obtain image search results from DuckDuckGo's search engine.

Note: Currently does not work when deployed on Vercel.com.

## Usage

To install:

```bash
# npm
npm install @mudbill/duckduckgo-images-api

# bun
bun add @mudbill/duckduckgo-images-api
```

TypeScript definitions are included.

The package provides a simple async/await API:

```ts
const images = await imageSearch({
  // the search term
  query: "pikachu",

  // filter by safe search (default true)
  safe: true,

  // number of result sets to fetch (default 1)
  // each set includes up to 100 images
  iterations: 1,

  // number of retries if a query fails
  retries: 2,
});
```

The `imageSearch` function returns a Promise that resolves to an array of complete results.

```ts
imageSearch({ query: "birds", safe: true }).then((results) =>
  console.log(results)
);
```

The `imageSearchGenerator` function is an async generator that yields a Promise of each result set. Useful for large iterations.

```ts
for await (let resultSet of imageSearchGenerator({
  query: "birds",
  safe: true,
  iterations: 4,
})) {
  // 4 loops of 100 images each
  console.log(resultSet);
}
```

Please feel free to report any issues or feature requests.

### Note

DuckDuckGo provides an instant answer API. This package does not use this route. This package mocks the browser behaviour using the same request format. Use it wisely.
