import { For, Show } from "solid-js"
import { useNavigate } from "@solidjs/router"
import { Icon } from "@opencode/ui/icon"
import { useCommand } from "@/shell/commands/command"
import { useCurrentRoute } from "@/shell/state/layout"
import { useSettingsDialog } from "@/settings/command"
import { usePlatform } from "@/runtime/platform/platform"
import { useLanguage } from "@/runtime/i18n/language"
import { OwlMark } from "./owl"

type RailItem = {
  id: string
  label: string
  icon: string
  run: () => void
  active?: () => boolean
}

/**
 * The rail is the app's spine: the mark, the three verbs that start work, the session
 * queue toggle, and the exit reading. It never collapses, so the window always has a
 * fixed left edge and the queue beside it is free to close.
 */
export function RagestarRail(props: {
  queueOpen: boolean
  onToggleQueue: () => void
  /** Absent while the window is too narrow to hold the inspector, so the rail never offers a dead control. */
  inspector?: { open: boolean; toggle: () => void }
}) {
  const command = useCommand()
  const route = useCurrentRoute()
  const platform = usePlatform()
  const openSettings = useSettingsDialog()
  const navigate = useNavigate()
  const language = useLanguage()

  const items = (): RailItem[] => [
    {
      id: "new",
      label: language.t("shell.rail.new"),
      icon: "plus",
      run: () => command.trigger("tab.new"),
    },
    {
      id: "search",
      label: language.t("shell.rail.search"),
      icon: "magnifying-glass",
      run: () => command.trigger("sessions.search"),
    },
    {
      id: "home",
      label: language.t("shell.rail.home"),
      icon: "grid-plus",
      run: () => navigate("/"),
      active: () => route().type === "home",
    },
  ]

  const phase = () => platform.egress?.state()?.phase ?? "idle"

  return (
    <nav data-slot="ragestar-rail" aria-label={language.t("shell.rail.primary")}>
      <button
        type="button"
        data-slot="ragestar-rail-brand"
        title="Ragestar"
        aria-label="Ragestar"
        onClick={() => navigate("/")}
      >
        <OwlMark size={22} />
      </button>

      <span data-slot="ragestar-rail-rule" aria-hidden="true" />

      <For each={items()}>
        {(item) => (
          <button
            type="button"
            data-slot="ragestar-rail-item"
            data-active={item.active?.() ? "" : undefined}
            title={item.label}
            aria-label={item.label}
            aria-current={item.active?.() ? "page" : undefined}
            onClick={item.run}
          >
            <Icon name={item.icon} />
          </button>
        )}
      </For>

      <button
        type="button"
        data-slot="ragestar-rail-item"
        data-active={props.queueOpen ? "" : undefined}
        data-rail-toggle=""
        title={props.queueOpen ? language.t("shell.rail.queue.hide") : language.t("shell.rail.queue.show")}
        aria-label={props.queueOpen ? language.t("shell.rail.queue.hide") : language.t("shell.rail.queue.show")}
        aria-pressed={props.queueOpen}
        onClick={props.onToggleQueue}
      >
        <Icon name="sidebar" />
      </button>

      <Show when={props.inspector}>
        {(inspector) => (
          <button
            type="button"
            data-slot="ragestar-rail-item"
            data-active={inspector().open ? "" : undefined}
            data-rail-toggle=""
            data-flip=""
            title={language.t(inspector().open ? "shell.inspector.hide" : "shell.inspector.show")}
            aria-label={language.t(inspector().open ? "shell.inspector.hide" : "shell.inspector.show")}
            aria-pressed={inspector().open}
            onClick={() => inspector().toggle()}
          >
            <Icon name="sidebar" />
          </button>
        )}
      </Show>

      <div data-slot="ragestar-rail-spacer" />

      <Show when={platform.egress}>
        <span
          data-slot="ragestar-rail-phase"
          data-phase={phase()}
          title={language.t("shell.rail.egress", { phase: phase() })}
          aria-hidden="true"
        />
      </Show>

      <button
        type="button"
        data-slot="ragestar-rail-item"
        title={language.t("shell.rail.settings")}
        aria-label={language.t("shell.rail.settings")}
        onClick={() => openSettings()}
      >
        <Icon name="settings-gear" />
      </button>
    </nav>
  )
}
