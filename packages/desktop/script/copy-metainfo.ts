import { resolveChannel } from "./utils"

const arg = process.argv[2]

const channel = arg === "dev" || arg === "beta" || arg === "prod" ? arg : resolveChannel()

const APP_IDS = {
  dev: "ai.ragestar.desktop.dev",
  beta: "ai.ragestar.desktop.beta",
  prod: "ai.ragestar.desktop",
} as const

const PRODUCT_NAMES = {
  dev: "ragestar Dev",
  beta: "ragestar Beta",
  prod: "ragestar",
} as const

const appId = APP_IDS[channel]

const productName = PRODUCT_NAMES[channel]

const summary = `AI coding agent${channel !== "prod" ? ` (${channel})` : ""}`

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<component type="desktop-application">
  <id>${appId}</id>

  <metadata_license>CC0-1.0</metadata_license>
  <project_license>MIT</project_license>

  <name>${productName}</name>
  <summary>${summary}</summary>

  <developer id="ai.ragestar">
    <name>ragestar</name>
  </developer>

  <description>
    <p>
      ragestar is a fork of OpenCode, the open source agent that helps you write and run code with any AI model.
      It adds a sidebar egress manager for direct, WARP, Tor and proxy lanes with rotation, and a theme engine.
    </p>
  </description>

  <launchable type="desktop-id">${appId}.desktop</launchable>

  <content_rating type="oars-1.1" />

  <url type="homepage">https://github.com/rajwardhanspimple/RageCode</url>
  <url type="vcs-browser">https://github.com/rajwardhanspimple/RageCode</url>

  <screenshots>
    <screenshot type="default">
      <image>https://raw.githubusercontent.com/rajwardhanspimple/RageCode/main/docs/screenshots/hero.png</image>
    </screenshot>
  </screenshots>
</component>
`

await Bun.write(`resources/${appId}.metainfo.xml`, xml)

console.log(`Generated metainfo for ${channel} at resources/${appId}.metainfo.xml`)
