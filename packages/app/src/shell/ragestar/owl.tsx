import type { JSX } from "solid-js"

/**
 * The Ragestar mark.
 *
 * One angular R on a faceted tile, drawn on a 256 grid so every size lands on whole
 * pixels. `tone="mono"` drops the tile and renders the bare R in the current colour,
 * which is what the titlebar and the installer icon want; `tone="brand"` keeps the
 * crimson gradient on its dark tile.
 *
 * The geometry is deliberately sharp: at 16px the leg still resolves, and at 128px the
 * facets read as a cut gem. No strokes: every edge is a filled polygon, so the mark stays
 * crisp at fractional device pixel ratios.
 */

/** The R sigil: one filled polygon, counter cut with evenodd. */
const R_SIGIL =
  "M76 52 H136 L170 60 Q196 70 196 100 Q196 128 172 136 L200 204 H158 L132 142 H116 V204 H76 Z " +
  "M116 90 H142 Q156 90 156 106 Q156 122 142 122 H116 Z"

export function OwlMark(props: { size?: number; tone?: "brand" | "mono"; class?: string }) {
  const size = () => props.size ?? 24
  const mono = () => props.tone === "mono"

  if (mono()) {
    return (
      <svg
        viewBox="0 0 256 256"
        width={size()}
        height={size()}
        class={props.class}
        role="img"
        aria-label="Ragestar"
        data-slot="owl-mark"
        data-tone="mono"
      >
        <path d={R_SIGIL} fill="currentColor" fill-rule="evenodd" />
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 256 256"
      width={size()}
      height={size()}
      class={props.class}
      role="img"
      aria-label="Ragestar"
      data-slot="owl-mark"
      data-tone={props.tone ?? "brand"}
    >
      {/* Tile: rounded square, split into two facets so the mark reads as a cut gem. */}
      <path
        d="M72 16 H184 A56 56 0 0 1 240 72 V184 A56 56 0 0 1 184 240 H72 A56 56 0 0 1 16 184 V72 A56 56 0 0 1 72 16 Z"
        fill="#1c100d"
      />
      <path d="M128 16 H72 A56 56 0 0 0 16 72 V184 A56 56 0 0 0 72 240 H128 Z" fill="#2e130f" opacity="0.9" />
      {/* The R: crimson gradient, one polygon, sharp shoulder and kicked leg. */}
      <path d={R_SIGIL} fill="url(#owl-mark-fill)" fill-rule="evenodd" />
      <defs>
        <linearGradient id="owl-mark-fill" x1="76" y1="52" x2="200" y2="204" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#ff8a70" />
          <stop offset="0.5" stop-color="#e02416" />
          <stop offset="1" stop-color="#b91c0f" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/** The eyes alone, for a working indicator that is not a spinner. */
export function OwlEyes(props: { size?: number; class?: string }) {
  const size = () => props.size ?? 16

  return (
    <svg
      viewBox="0 0 64 32"
      width={size() * 2}
      height={size()}
      class={props.class}
      aria-hidden="true"
      data-slot="owl-eyes"
    >
      <path d="M22 6 L8 18 L22 30 L22 23 L16 18 L22 13 Z" fill="currentColor" />
      <path d="M42 6 L56 18 L42 30 L42 23 L48 18 L42 13 Z" fill="currentColor" />
    </svg>
  )
}

/**
 * The send glyph: two upward chevrons, the owl's brow repeated.
 *
 * Every chat app ships an arrow in this seat; the pair is what makes the composer
 * read as this app at a glance. Filled polygons, not strokes, so it stays crisp at 16px.
 */
export function OwlSend(props: { size?: number; class?: string }) {
  const size = () => props.size ?? 16

  return (
    <svg
      viewBox="0 0 24 24"
      width={size()}
      height={size()}
      class={props.class}
      fill="currentColor"
      aria-hidden="true"
      data-slot="owl-send"
    >
      <path d="M4.5 14 L8 10.5 L11.5 14 L11.5 11.8 L8 8.3 L4.5 11.8 Z" />
      <path d="M12.5 14 L16 10.5 L19.5 14 L19.5 11.8 L16 8.3 L12.5 11.8 Z" />
    </svg>
  )
}

/**
 * Mark plus wordmark, for the sidebar header and the About panel.
 *
 * The wordmark is set, not drawn: one weight, wide tracking, uppercase. Drawing it as
 * paths would freeze the typeface for every future size; setting it means the same string
 * can shrink to 11px in the titlebar without a second asset.
 */
export function OwlLockup(props: { size?: number; class?: string }): JSX.Element {
  const size = () => props.size ?? 22

  return (
    <span class={props.class} data-slot="owl-lockup" style={{ display: "inline-flex", "align-items": "center", gap: "8px" }}>
      <OwlMark size={size()} />
      <span
        style={{
          "font-family": "var(--owl-font-display)",
          "font-size": `${Math.round(size() * 0.66)}px`,
          "font-weight": "700",
          "letter-spacing": "0.14em",
          "text-transform": "uppercase",
          "line-height": "1",
          color: "currentColor",
        }}
      >
        Ragestar
      </span>
    </span>
  )
}
