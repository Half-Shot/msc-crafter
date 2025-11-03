# Backend service for msc-crafter

This service provides a small number of endpoints to service GitHub OAuth token requests.

## Building

```sh
yarn
yarn build
```

## Running

This service is built to be run as a container. The service holds no state and all pending sessions
are wiped on process restart.

You must [create a GitHub App](https://github.com/settings/apps/new).
You will need to specify a **Callback URL** that directs to `https://<your_domain_for_this_backend>/auth/callback`

The following environment variables must be specified:

- `GITHUB_CLIENT_ID` - Your GitHub App Client ID.
- `GITHUB_CLIENT_SECRET` - Your GitHub App Client Secret.
- `GITHUB_REDIRECT_URL` - The URL for the redirect. Should be the same as your **Callback URL**.
- `FRONTEND_URL` - The URL that points to the frontend of the app.
