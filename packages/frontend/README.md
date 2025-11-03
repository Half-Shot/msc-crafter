# Frontend for msc-crafter

This is the frontend for MSC Crafter, written in Preact.

## Structure

- `src/` contains the source for the frontend.
- `components/` contains the set of React components.
  - `atoms/` contains the atomic components which are used by larger view components.
- `github/` contains the code for fetching GitHub information, including GraphQL queries.
- `hooks/` contains various hook functions, as well as contexts.
- `models/` contains interfaces used all over the app.
- `utils/` contains bits of utility code.

## Building

```sh
yarn
VITE_BACKEND_URL=https://your-backend-domain yarn build
```

## Running

Currently there isn't a container for the frontend, the `build` command will output all files needed
to use the frontend in `dist/`.
