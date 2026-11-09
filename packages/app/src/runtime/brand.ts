/**
 * Every external destination the client itself links to.
 *
 * Nothing here belongs to a provider. The app is a generic client: providers are chosen by the
 * user, and their endpoints live in the community add-on registry, never in this file.
 */
export const BRAND = {
  name: "Ragestar",
  repo: "https://github.com/ragestar/Ragestar",
  issues: "https://github.com/ragestar/Ragestar/issues",
  discussions: "https://github.com/ragestar/Ragestar/discussions",
  docs: "https://github.com/ragestar/Ragestar/blob/main/README.md",
  addons: "https://github.com/ragestar/Ragestar/blob/main/PRESETS.md",
  security: "https://github.com/ragestar/Ragestar/blob/main/docs/security/virustotal.md",
} as const
