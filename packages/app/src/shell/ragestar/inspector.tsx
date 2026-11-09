import { Show, createMemo } from "solid-js"
import { Icon } from "@opencode/ui/icon"
import { usePlatform } from "@/runtime/platform/platform"
import { useCurrentRoute } from "@/shell/state/layout"
import { tabKey, useTabs } from "@/shell/tabs/tabs"
import { sessionTabTitle } from "@/shell/titlebar/tab-title"
import { RagestarEgress } from "./egress-block"
import { RagestarTheme } from "./theme-block"
import { OwlMark } from "./owl"

const surfaceLabel = {
  home: "Home",
  settings: "Settings",
  connect: "Connect",
  components: "Components",
  draft: "Draft",
  session: "Session",
} as const

/**
 * The inspector is the third lane: the surface you are on, the exit your requests take,
 * and the theme engine. Everything here is a reading rather than a route, so the
 * transcript keeps the full plane and the controls keep a fixed home.
 */
export function RagestarInspector(props: { onClose: () => void }) {
  const platform = usePlatform()
  const route = useCurrentRoute()
  const tabs = useTabs()

  const current = createMemo(() => {
    const value = route()

    if (value.type === "draft")
      return tabs.store.find((tab) => tab.type === "draft" && tab.draftID === value.draftID)

    if (value.type === "session")
      return tabs.store.find((tab) => tab.type === "session" && tab.sessionId === value.sessionId)

    return undefined
  })

  const title = createMemo(() => {
    const tab = current()

    if (!tab) return surfaceLabel[route().type]
    return sessionTabTitle(tabs.info[tabKey(tab)]?.title, "Untitled session")
  })

  const server = () => {
    const value = route()
    return value.type === "session" ? value.server : undefined
  }

  return (
    <aside data-slot="ragestar-inspector" aria-label="Inspector">
      <header data-slot="ragestar-inspector-head">
        <OwlMark size={14} />
        <span>Inspector</span>
        <button
          type="button"
          data-slot="ragestar-icon"
          data-push=""
          title="Hide inspector"
          aria-label="Hide inspector"
          onClick={props.onClose}
        >
          <Icon name="xmark-small" />
        </button>
      </header>

      <div data-slot="ragestar-inspector-scroll">
        <section data-slot="ragestar-block">
          <header data-slot="ragestar-block-head">
            <span data-slot="ragestar-block-label">Surface</span>
          </header>
          <p data-slot="ragestar-route-title" title={title()}>
            {title()}
          </p>
          <dl data-slot="ragestar-kv">
            <div>
              <dt>Kind</dt>
              <dd data-mono="">{surfaceLabel[route().type]}</dd>
            </div>
            <Show when={server()}>
              {(value) => (
                <div>
                  <dt>Server</dt>
                  <dd data-mono="" title={value()}>
                    {value()}
                  </dd>
                </div>
              )}
            </Show>
            <div>
              <dt>Queue</dt>
              <dd data-mono="">{tabs.store.length}</dd>
            </div>
            <div>
              <dt>Recent</dt>
              <dd data-mono="">{tabs.closed.length}</dd>
            </div>
          </dl>
        </section>

        <RagestarEgress />
        <RagestarTheme />

        <footer data-slot="ragestar-inspector-foot">
          <span>Ragestar</span>
          <span data-mono="">{platform.version ? `v${platform.version}` : "dev"}</span>
        </footer>
      </div>
    </aside>
  )
}
