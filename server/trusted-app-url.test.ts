import assert from "node:assert/strict";
import test from "node:test";
import { resolveTrustedApp, trustedAppsFromEnv } from "./trusted-app-url";

test("APP_URL is used even when the browser sends a different host", () => {
  const app = resolveTrustedApp(
    {
      appUrl: "https://vault.example.com/ignored",
      replitDomains: "evil.replit.app",
    },
    "attacker.example",
  );

  assert.equal(app.origin, "https://vault.example.com");
  assert.equal(app.hostname, "vault.example.com");
});

test("Replit domains are trusted when APP_URL is not set", () => {
  const app = resolveTrustedApp(
    { replitDomains: "chat.replit.app, chat.replit.dev" },
    "chat.replit.dev",
  );

  assert.equal(app.origin, "https://chat.replit.dev");
});

test("an unknown browser host falls back to the first Replit domain", () => {
  const app = resolveTrustedApp(
    { replitDomains: "chat.replit.app, chat.replit.dev" },
    "attacker.example",
  );

  assert.equal(app.origin, "https://chat.replit.app");
});

test("missing configuration is rejected", () => {
  assert.throws(() => trustedAppsFromEnv({}), /APP_URL/);
});

test("addresses with a password are rejected", () => {
  assert.throws(
    () => trustedAppsFromEnv({ appUrl: "https://user:secret@vault.example.com" }),
    /password/,
  );
});
