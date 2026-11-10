/**
 * Every external destination the client itself links to.
 *
 * Nothing here belongs to a provider. The app is a generic client: providers are chosen by the
 * user, and their endpoints live in the community add-on registry, never in this file.
 */
export const BRAND = {
  name: "Ragestar",
  repo: "https://github.com/rajwardhanspimple/RageCode",
  issues: "https://github.com/rajwardhanspimple/RageCode/issues",
  discussions: "https://github.com/rajwardhanspimple/RageCode/discussions",
  releases: "https://github.com/rajwardhanspimple/RageCode/releases/latest",
  docs: "https://github.com/rajwardhanspimple/RageCode/blob/main/README.md",
  addons: "https://github.com/rajwardhanspimple/RageCode/blob/main/PRESETS.md",
  security: "https://github.com/rajwardhanspimple/RageCode/blob/main/docs/security/virustotal.md",
  bugReport: "https://github.com/rajwardhanspimple/RageCode/issues/new?template=bug-report.yml",
  featureRequest: "https://github.com/rajwardhanspimple/RageCode/issues/new?template=feature-request.yml",
} as const
