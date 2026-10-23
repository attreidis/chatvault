export type TrustedApp = {
  origin: string;
  hostname: string;
};

export type TrustedAppEnv = {
  appUrl?: string;
  replitDomains?: string;
};

function clip(value: string): string {
  return value.length > 200 ? value.slice(0, 200) : value;
}

function parseAppUrl(value: string, source: string): TrustedApp {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(
      `${source} must be a full address such as https://your-app.replit.app. Received "${clip(value)}".`,
    );
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error(`${source} must start with https:// or http://.`);
  }
  if (url.username || url.password) {
    throw new Error(`${source} must not include a username or password.`);
  }
  if (!url.hostname) {
    throw new Error(`${source} must include a host name.`);
  }

  return { origin: url.origin, hostname: url.hostname.toLowerCase() };
}

function replitDomainToUrl(domain: string): string {
  if (domain.startsWith("https://") || domain.startsWith("http://")) return domain;
  return `https://${domain}`;
}

export function trustedAppsFromEnv(env: TrustedAppEnv): TrustedApp[] {
  const explicit = env.appUrl?.trim();
  if (explicit) {
    return [parseAppUrl(explicit, "APP_URL")];
  }

  const domains = (env.replitDomains ?? "")
    .split(",")
    .map((domain) => domain.trim())
    .filter(Boolean);

  if (domains.length === 0) {
    throw new Error(
      "Set APP_URL to this site's real address, such as https://your-app.replit.app. On Replit, REPLIT_DOMAINS is used automatically when APP_URL is empty.",
    );
  }

  return domains.map((domain) =>
    parseAppUrl(replitDomainToUrl(domain), "REPLIT_DOMAINS"),
  );
}

export function resolveTrustedApp(env: TrustedAppEnv, requestHost?: string): TrustedApp {
  const trusted = trustedAppsFromEnv(env);
  const host = requestHost?.trim().toLowerCase();
  const match = host ? trusted.find((app) => app.hostname === host) : undefined;
  return match ?? trusted[0];
}

export function readTrustedAppEnv(): TrustedAppEnv {
  return {
    appUrl: process.env.APP_URL,
    replitDomains: process.env.REPLIT_DOMAINS,
  };
}
