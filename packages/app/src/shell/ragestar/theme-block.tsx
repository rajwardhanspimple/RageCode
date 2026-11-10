import { For, onMount } from "solid-js"
import { Icon } from "@opencode/ui/icon"
import { useTheme } from "@opencode/ui/theme/context"
import { useSettingsDialog } from "@/settings/command"
import { useLanguage } from "@/runtime/i18n/language"

const schemes = [
  { id: "system", label: "shell.theme.scheme.auto" },
  { id: "light", label: "theme.scheme.light" },
  { id: "dark", label: "theme.scheme.dark" },
] as const

/**
 * The theme engine in one row: the active theme's name, a swatch strip that changes it on
 * click, and the three color schemes. The full catalogue stays one click away so the strip
 * can stay short enough to read.
 */
export function RagestarTheme() {
  const theme = useTheme()
  const openAppearance = useSettingsDialog("appearance")
  const language = useLanguage()

  onMount(() => void theme.loadThemes())

  // A theme may describe itself with a palette or with seed colors; either gives the strip
  // one honest color to paint.
  const swatch = (id: string) => {
    const variant = theme.themes()[id]?.dark

    if (!variant) return "var(--v2-grey-500)"

    const palette = "palette" in variant ? variant.palette : undefined
    const seeds = "seeds" in variant ? variant.seeds : undefined

    return palette?.primary ?? seeds?.primary ?? "var(--v2-grey-500)"
  }

  return (
    <section data-slot="ragestar-theme">
      <header data-slot="ragestar-block-head">
        <span data-slot="ragestar-theme-glyph" aria-hidden="true">
          <Icon name="edit" />
        </span>
        <span>{language.t("shell.theme.title")}</span>
        <span data-slot="ragestar-block-note" data-truncate="" title={theme.name(theme.themeId())}>
          {theme.name(theme.themeId())}
        </span>
        <button
          type="button"
          data-slot="ragestar-icon"
          data-push=""
          title={language.t("shell.theme.open")}
          aria-label={language.t("shell.theme.open")}
          onClick={() => openAppearance()}
        >
          <Icon name="settings-gear" />
        </button>
      </header>

      <div data-slot="ragestar-swatches" role="listbox" aria-label={language.t("shell.theme.title")}>
        <For each={theme.ids()}>
          {(id) => (
            <button
              type="button"
              data-slot="ragestar-swatch"
              data-active={id === theme.themeId() ? "" : undefined}
              role="option"
              aria-selected={id === theme.themeId()}
              aria-label={theme.name(id)}
              title={theme.name(id)}
              style={{ "--ragestar-swatch": swatch(id) }}
              onClick={() => theme.setTheme(id)}
            />
          )}
        </For>
      </div>

      <div data-slot="ragestar-schemes" role="group" aria-label={language.t("shell.theme.scheme")}>
        <For each={schemes}>
          {(scheme) => (
            <button
              type="button"
              data-slot="ragestar-scheme"
              data-active={theme.colorScheme() === scheme.id ? "" : undefined}
              aria-pressed={theme.colorScheme() === scheme.id}
              onClick={() => theme.setColorScheme(scheme.id)}
            >
              {language.t(scheme.label)}
            </button>
          )}
        </For>
      </div>
    </section>
  )
}
