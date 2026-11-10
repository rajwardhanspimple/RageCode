import { For, Show, createMemo, createSignal } from "solid-js"
import { createMediaQuery } from "@solid-primitives/media"
import { Icon } from "@opencode/ui/icon"
import { useCommand } from "@/shell/commands/command"
import { useCurrentRoute } from "@/shell/state/layout"
import { tabKey, useTabs, type Tab } from "@/shell/tabs/tabs"
import { sessionTabTitle } from "@/shell/titlebar/tab-title"
import { useLanguage } from "@/runtime/i18n/language"
import { OwlMark } from "./owl"
import "./ragestar.css"
import "./owl-tokens.css"

/**
 * The queue.
 *
 * Every open tab is a row in a ledger: an ordinal, a state dot, the title, and the
 * close seat. Newest first, because the row the composer is about to write into is the
 * one the eye wants at the top. Sessions come from the tab store, so a row opens exactly
 * what the tab strip opens.
 */
export function RagestarSidebar() {
  // The build channel, not a fixed word: a release build carries no channel badge at all.
  const channel = import.meta.env.VITE_OPENCODE_CHANNEL ?? "dev"
  const tabs = useTabs()
  const command = useCommand()
  const route = useCurrentRoute()
  const language = useLanguage()

  const [open, setOpen] = createSignal(true)
  const narrow = createMediaQuery("(max-width: 860px)")

  // Below 860px the inspector retires first; the queue stays, because it is the only
  // list of open work the window has.
  const rows = createMemo(() => tabs.store.slice().reverse())

  const active = (tab: Tab) => {
    const current = route()

    if (tab.type === "draft") return current.type === "draft" && current.draftID === tab.draftID

    return current.type === "session" && current.sessionId === tab.sessionId
  }

  const label = (tab: Tab) =>
    sessionTabTitle(
      tabs.info[tabKey(tab)]?.title,
      language.t(tab.type === "draft" ? "command.session.new" : "shell.session.untitled"),
    )

  const select = (tab: Tab) => tabs.select(tab)

  const close = (tab: Tab) => {
    const index = tabs.store.findIndex((item) => tabKey(item) === tabKey(tab))

    if (index !== -1) tabs.closeTab(index)
  }

  return (
    <aside data-slot="ragestar-sidebar">
      <header data-slot="ragestar-head">
        <span data-slot="ragestar-logo">
          <OwlMark size={20} />
        </span>
        <span data-slot="ragestar-wordmark">Ragestar</span>
        <Show when={channel !== "prod"}>
          <span data-slot="ragestar-beta">
            {language.t(channel === "beta" ? "shell.channel.beta" : "shell.channel.dev")}
          </span>
        </Show>
      </header>

      <div data-slot="ragestar-actions">
        <button type="button" data-slot="ragestar-new" onClick={() => command.trigger("tab.new")}>
          <Icon name="plus" />
          <span>{language.t("shell.sidebar.new")}</span>
        </button>
        <button type="button" data-slot="ragestar-search" onClick={() => command.trigger("sessions.search")}>
          <Icon name="magnifying-glass" />
          <span>{language.t("shell.sidebar.search")}</span>
          <kbd>{command.keybind("sessions.search")}</kbd>
        </button>
      </div>

      <div data-slot="ragestar-section-head">
        <button
          type="button"
          data-slot="ragestar-section-grow"
          data-open={open() ? "" : undefined}
          onClick={() => setOpen(!open())}
        >
          <Icon name="chevron-down" />
          <span>{language.t("shell.sidebar.queue")}</span>
        </button>
        <span data-slot="ragestar-count">{rows().length}</span>
        <button
          type="button"
          data-slot="ragestar-icon"
          title={language.t("shell.sidebar.filter")}
          aria-label={language.t("shell.sidebar.filter")}
          onClick={() => command.trigger("sessions.search")}
        >
          <Icon name="sliders" />
        </button>
      </div>

      <Show when={open()}>
        <div data-slot="ragestar-sessions">
          <For each={rows()}>
            {(tab, index) => (
              <div
                data-slot="ragestar-row"
                data-active={active(tab) ? "" : undefined}
                data-owl-talon={active(tab) ? "" : undefined}
                role="button"
                tabindex="0"
                aria-current={active(tab) ? "page" : undefined}
                onClick={() => select(tab)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" && event.key !== " ") return
                  event.preventDefault()
                  select(tab)
                }}
              >
                <span data-slot="ragestar-row-index" aria-hidden="true">
                  {String(index() + 1).padStart(2, "0")}
                </span>
                <span data-slot="ragestar-row-dot" data-active={active(tab) ? "" : undefined} aria-hidden="true" />
                <span data-slot="ragestar-row-title" title={label(tab)}>
                  {label(tab)}
                </span>
                <button
                  type="button"
                  data-slot="ragestar-row-close"
                  title={language.t("shell.sidebar.closeTitle")}
                  aria-label={language.t("shell.sidebar.close", { title: label(tab) })}
                  onClick={(event) => {
                    event.stopPropagation()
                    close(tab)
                  }}
                >
                  <Icon name="xmark-small" />
                </button>
              </div>
            )}
          </For>
          <Show when={rows().length === 0}>
            <p data-slot="ragestar-empty">{language.t("shell.sidebar.empty")}</p>
          </Show>
        </div>
      </Show>

      <div data-slot="ragestar-sidebar-bottom">
        <span data-slot="ragestar-queue-foot">
          <span>{narrow() ? "" : language.plural("shell.sidebar.open", rows().length)}</span>
          <span data-mono="">{language.plural("shell.sidebar.recent", tabs.closed.length)}</span>
        </span>
      </div>
    </aside>
  )
}
