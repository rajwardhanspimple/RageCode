import { For, Show, createEffect, createSignal, onCleanup } from "solid-js"
import { Icon } from "@opencode/ui/icon"
import { Loader } from "@opencode/ui/loader"
import { useDialog } from "@opencode/ui/context/dialog"
import { usePlatform } from "@/runtime/platform/platform"
import { useLanguage } from "@/runtime/i18n/language"
import { infiniteLanes, laneLabel, phaseLabel, type InfiniteLane } from "@/egress"
import { EgressPanel } from "@/shell/egress/panel"

/**
 * The sidebar's view of the egress engine: the exit address, the lane switch, and the one
 * button that changes where the next request comes from.
 *
 * Everything with a table in it stays in the panel. This block is a readout and three
 * controls, sized to the sidebar, so a rotation never needs a settings screen.
 */
export function RagestarEgress() {
  const platform = usePlatform()
  const dialog = useDialog()
  const language = useLanguage()
  const [busy, setBusy] = createSignal(false)
  const [started, setStarted] = createSignal(0)
  const [tick, setTick] = createSignal(0)

  const engine = () => platform.egress
  const state = () => engine()?.state()
  const lane = () => state()?.lane
  const working = () => state()?.phase === "probing" || state()?.phase === "rotating"
  const elapsed = () => (started() ? Math.max(0, Math.floor((tick() - started()) / 1000)) : 0)

  // A WARP registration is a minute of the daemon's time. A spinner that never counts is
  // indistinguishable from a button that did nothing, so the note carries the seconds.
  createEffect(() => {
    if (!working()) {
      setStarted(0)

      return
    }

    if (!started()) {
      setStarted(Date.now())
      setTick(Date.now())
    }

    const timer = setInterval(() => setTick(Date.now()), 1000)
    onCleanup(() => clearInterval(timer))
  })

  // The current lane shows the engine's phase; the others show the last health reading.
  const dot = (target: InfiniteLane) => {
    if (target === lane()) {
      if (working()) return "busy"

      return state()?.phase === "error" ? "down" : "current"
    }

    const entry = state()?.health.find((item) => item.lane === target)

    if (!entry || entry.checkedAt === 0) return "unknown"

    return entry.alive ? "ok" : "down"
  }

  const rotate = async () => {
    if (busy()) return

    setBusy(true)

    try {
      await engine()?.rotate()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Show when={platform.egress}>
      <section data-slot="ragestar-egress" data-phase={state()?.phase ?? "idle"}>
        <header data-slot="ragestar-block-head">
          <span data-slot="ragestar-phase-dot" data-phase={state()?.phase ?? "idle"} aria-hidden="true" />
          <span>{language.t("shell.egress.title")}</span>
          <span data-slot="ragestar-block-note" data-truncate="">
            {state() ? phaseLabel(state()!) : language.t("shell.egress.loading")}
            {working() && elapsed() > 0 ? ` ${elapsed()}s` : ""}
          </span>
          <button
            type="button"
            data-slot="ragestar-icon"
            data-push=""
            title={language.t("shell.egress.open")}
            aria-label={language.t("shell.egress.open")}
            onClick={() => void dialog.show(() => <EgressPanel />)}
          >
            <Icon name="sliders" />
          </button>
        </header>

        <div data-slot="ragestar-egress-trace">
          <Show
            when={state()?.trace}
            fallback={
              <span data-slot="ragestar-egress-ip" data-muted="">
                {language.t("shell.egress.empty")}
              </span>
            }
          >
            {(trace) => (
              <>
                <span data-slot="ragestar-egress-ip" title={trace().ip}>
                  {trace().ip}
                </span>
                <Show when={trace().loc}>
                  <span data-slot="ragestar-egress-loc">{trace().loc}</span>
                </Show>
              </>
            )}
          </Show>
        </div>

        <div data-slot="ragestar-lanes" role="group" aria-label={language.t("shell.egress.lane")}>
          <For each={infiniteLanes}>
            {(target) => (
              <button
                type="button"
                data-slot="ragestar-lane"
                data-active={target === lane() ? "" : undefined}
                aria-pressed={target === lane()}
                title={language.t("shell.egress.laneHint", { lane: laneLabel(target) })}
                onClick={() => void engine()?.setLane(target)}
              >
                <span data-slot="ragestar-live-dot" data-state={dot(target)} aria-hidden="true" />
                {laneLabel(target)}
              </button>
            )}
          </For>
        </div>

        <div data-slot="ragestar-egress-actions">
          <button
            type="button"
            data-slot="ragestar-rotate"
            disabled={busy() || working() || !state()}
            title={language.t("shell.egress.rotateHint")}
            onClick={() => void rotate()}
          >
            <Show when={busy() || working()} fallback={<Icon name="refresh" />}>
              <Loader width={12} height={12} />
            </Show>
            <span>{language.t("shell.egress.rotate")}</span>
          </button>
          <button
            type="button"
            data-slot="ragestar-arm"
            data-armed={state()?.armed ? "" : undefined}
            aria-pressed={state()?.armed ?? false}
            title={language.t("shell.egress.armHint")}
            onClick={() => void engine()?.arm(!state()?.armed)}
          >
            <Icon name="lock" />
            <span>{language.t(state()?.armed ? "shell.egress.armed" : "shell.egress.arm")}</span>
          </button>
        </div>

        <Show when={state()?.watch}>
          <p data-slot="ragestar-egress-watch" title={state()!.watch}>
            {state()!.watch}
          </p>
        </Show>

        <Show when={state()?.phase === "error" && state()?.lastError}>
          <p data-slot="ragestar-egress-error" title={state()!.lastError}>
            {state()!.lastError}
          </p>
        </Show>
      </section>
    </Show>
  )
}
