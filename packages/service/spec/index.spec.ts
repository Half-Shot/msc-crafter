import assert from "node:assert";
import { test } from "node:test";
import { CrafterService } from "../lib/index.mts";

test("service fails to start with missing env vars", () => {
  // This test passes because it does not throw an exception.
  assert.throws(
    () => new CrafterService(),
    /Expected enviroment key is missing GITHUB_CLIENT_ID/,
  );
  assert.throws(
    () => new CrafterService({ GITHUB_CLIENT_ID: "foo" }),
    /Expected enviroment key is missing GITHUB_CLIENT_SECRET/,
  );
  assert.throws(
    () =>
      new CrafterService({
        GITHUB_CLIENT_ID: "foo",
        GITHUB_CLIENT_SECRET: "bar",
      }),
    /Expected enviroment key is missing FRONTEND_URL/,
  );
  assert.throws(
    () =>
      new CrafterService({
        GITHUB_CLIENT_ID: "foo",
        GITHUB_CLIENT_SECRET: "bar",
        FRONTEND_URL: "url",
      }),
    /TypeError: Invalid URL/,
  );
});

test("service can start with viable config", async () => {
  const service = new CrafterService({
    GITHUB_CLIENT_ID: "foo",
    GITHUB_CLIENT_SECRET: "bar",
    FRONTEND_URL: "https://example.org",
  });
  await service.start(0, "127.0.0.1");
  service.stop();
});

test("service handles /health requests", async () => {
  const service = new CrafterService({
    GITHUB_CLIENT_ID: "foo",
    GITHUB_CLIENT_SECRET: "bar",
    FRONTEND_URL: "https://example.org",
  });
  await service.start(0, "127.0.0.1");
  const req = await fetch(new URL("/health", service.listenUrl!));
  assert.deepEqual(await req.json(), { ok: true });
  service.stop();
});

test("service handles /AUTH requests", async () => {
  const service = new CrafterService({
    GITHUB_CLIENT_ID: "foo",
    GITHUB_CLIENT_SECRET: "bar",
    FRONTEND_URL: "https://example.org",
  });
  try {
    await service.start(0, "127.0.0.1");
    const req = await fetch(new URL("/auth", service.listenUrl!));
    const res = await req.json();
    assert.ok(res.url);
    const parsedUrl = new URL(res.url);
    assert.equal(parsedUrl.origin, "https://github.com");
    assert.equal(parsedUrl.pathname, "/login/oauth/authorize");
    assert.equal(parsedUrl.searchParams.get("client_id"), "foo");
    assert.equal(parsedUrl.searchParams.get("scope"), "repo,gist");
    assert.match(parsedUrl.searchParams.get("state")!, /mscraft-.+/);
  } finally {
    service.stop();
  }
});
