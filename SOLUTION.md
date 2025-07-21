# Solution
Below are my solutions and explanations as to how I modified the code that was given to me.

## Testing
Please make sure to run `npm install` for both the `frontend` and `backend` packages, as dependencies have changed. Unit tests have been added to the backend and frontend, so you can run `npm test` in both directories to run the tests.

## General Improvements/Fixes
1. Added `redis` for caching, `yup` for type validation, and other dependencies
2. Fixed blocking code by making reads asynchronous
3. Added validation middleware for item creation
4. Added redis cache for `items` and `stats` reads as needed
5. Added more items to `items.json` for testing purposes

## Backend
1. **Refactor blocking I/O**: To fix this, I updates the `readData` function inside of `src/routes/items.js` to use the asynchronous `readFile` function instead of `readFileSync`.
2. **Performance**: The main performance improvement for the backend was the introduction of Redis as a caching mechanism when fetching items/`items.json`. Now, whenever the API is started, we connect to a local Redis instance and cache any results that are fetched from the API.
3. **Unit Tests**: Unit tests for the backend have been added for the `redis.js`, `items.js`, and `stats.js` files

I also updated the backend to work with pagination by adding a `limit` and `offset` check to the `/api/items` route

## Frontend
1. **Memory Leak**: The memory leak was fixed by making sure that the component is only rendered if we are able to get items
2. **Pagination and Virtualization**: This was implemented using a new `LazyLoadItems.js` component that was made using an instance of [react-window-infinite-loader](https://www.npmjs.com/package/react-window-infinite-loader). This allows us to be able to lazy load items from the API as the user scrolls to the end of the list. This also fixes performance due to the fact that the `react-window-infinite-loader` package utilizes virtualization.
3. **Search**: I created a `Search.js` component that utilizes the API to look through our documents and return items via a search query.
