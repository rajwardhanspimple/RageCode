import { app } from "electron"

type Channel = "local" | "dev" | "beta" | "prod"

const raw = import.meta.env.OPENCODE_CHANNEL

export const CHANNEL: Channel = raw === "local" || raw === "dev" || raw === "beta" || raw === "prod" ? raw : "dev"

export const VERSION = app.isPackaged ? app.getVersion() : (process.env.OPENCODE_VERSION ?? app.getVersion())

const appNames: Record<string, string> = {
  dev: "Ragestar Dev",
  beta: "Ragestar Beta",
  prod: "Ragestar",
}

const appIDs: Record<string, string> = {
  dev: "ai.ragestar.desktop.dev",
  beta: "ai.ragestar.desktop.beta",
  prod: "ai.ragestar.desktop",
}

// Local renderer/server mode keeps the dev application identity.
export const APP_NAME = app.isPackaged ? appNames[CHANNEL] : "Ragestar Dev"

// An unpackaged build derives its profile from this id. Setting RAGESTAR_APP_ID keeps two
// checkouts (or a private and a public tree) from sharing one userData directory, one cache,
// and one single-instance lock.
const DEVELOPMENT_APP_ID = process.env.RAGESTAR_APP_ID?.trim() || "ai.ragestar.desktop.dev"

export const APP_ID = app.isPackaged ? appIDs[CHANNEL] : DEVELOPMENT_APP_ID
