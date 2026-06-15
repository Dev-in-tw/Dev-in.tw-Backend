/**
 * Subdomain labels that may never be registered by users — infrastructure,
 * mail, and platform-reserved names. Kept as a Set for O(1) membership checks.
 */
export const RESERVED_SUBDOMAINS = new Set<string>([
  "www",
  "api",
  "mail",
  "admin",
  "ftp",
  "smtp",
  "ns",
  "ns1",
  "ns2",
  "dns",
  "mx",
  "cdn",
  "static",
  "assets",
  "app",
  "dev",
  "staging",
  "test",
  "blog",
  "docs",
  "status",
  "dashboard",
  "panel",
  "root",
  "cpanel",
  "webmail",
]);

/**
 * A single DNS label: 1–63 chars, lowercase alphanumerics and hyphens, must not
 * start or end with a hyphen.
 */
export const SUBDOMAIN_REGEX = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
