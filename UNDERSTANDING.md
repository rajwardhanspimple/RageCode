# Ragestar — Codebase Understanding

> **Scope & honesty note.** This document is built from a direct, file-by-file read of the
> repository. As of this writing the **`packages/core` engine has been deep-read (~291 of its
> 519 `src` files)**. The remaining ~228 core files and the other ~30 packages (`ai`, `app`,
> `tui`, `desktop`, `gui-plugins`, `schema`, `server`, `client`, `protocol`, `sdk`, `util`,
> `codemode`, the UI kits, services, infra, scripts, Rust, i18n, tests, docs) are **not yet
> read**. Sections describing those areas are labelled **[PENDING]** and only claim what the
> root docs (`README`, `NOTICE`, `CREDITS`, `AGENTS`, `CONTRIBUTING`) actually state. Nothing
> here is invented; where a subsystem has not been read, it is flagged rather than guessed.
> A coverage ledger is at the end. This file is intended to be expanded as the read continues.

---

## 1. What Ragestar is

Ragestar is an **independent, MIT-licensed fork of the OpenCode desktop application**
(upstream `anomalyco/opencode`). It is a **provider-agnostic desktop AI client for developers**.
It is *not* affiliated with or endorsed by OpenCode.

Core product claims (from `README.md`, `NOTICE.md`, `CREDITS.md`):

- **One engine, many shells.** The desktop shell drives the upstream OpenCode CLI engine as a
  **sidecar process**, so tool execution, permissions, and MCP servers behave the same as the CLI.
  The shell is an independent rewrite with its own identity, theme engine, and egress manager.
- **Multi-lane egress.** Direct, Cloudflare WARP, Tor, and proxy "lanes", each with health,
  latency, and rotation. Rotate on demand or arm a lane to auto-rotate. `autoRecover` is off by
  default so a rotation is never retried behind the user's back.
- **Session isolation.** Every session keeps its own workspace, model selection, and agent.
- **Provider-agnostic / nothing preconfigured.** No endpoint in source, no bundled key, no
  account. Providers come from community *data*: a local `presets.json`, a shipped
  `community-presets.json` template, an installed `community-addons.json`, or a registry URL the
  user pastes. Applying an add-on writes exactly one field —
  `provider.<id>.options.baseURL` — into the app's isolated engine config.
- **Isolated engine profile.** The engine's `XDG_DATA_HOME`, `XDG_CONFIG_HOME`, `XDG_CACHE_HOME`,
  `XDG_STATE_HOME` are redirected under `<userData>/engine`, and inherited `OPENCODE_CONFIG*`
  env is cleared, so a fresh profile never touches a separate OpenCode installation.
- **No telemetry endpoint.** The app contacts only configured provider endpoints and the registry
  URL the user explicitly loads. Release builds carry no Sentry DSN by default.
- **Three platforms, real packages.** NSIS installer (Windows), `.dmg` (macOS arm64/x64),
  `.AppImage`/`.deb`/`.rpm` (Linux x64), built on native runners.
- **Updates.** Release builds point `electron-updater` at *this repository's own* releases
  (`RAGESTAR_UPDATE_REPO`); `autoDownload` off. Engine updates are separate: a production build
  may adopt a newer `@opencode/cli` from npm only after proving integrity (sha512), booting against
  a throwaway data dir, serving all 25 required routes, and completing a create-then-delete session
  round trip. Adoption is permanent only once the sidecar connects on the next launch; otherwise it
  reverts and remembers the rejection.

**Version / tooling:** `package.json` is `ragestar` v2.2.8, `packageManager: bun@1.4.4`,
private monorepo, `type: module`. License MIT, `Copyright (c) 2025 opencode` +
`Copyright (c) 2026 ragestar contributors`.

**Egress lane dependencies (from `CREDITS.md`):** Tor Expert Bundle (launched by the Tor lane,
circuit rotation via `SIGNAL NEWNYM`); Cloudflare WARP (`warp-cli` registration rotation when
installed); public proxy lists (proxyscrape, proxmint, iplocate) scraped at runtime, not bundled.
The Ragestar visual language/theme is original to the fork; UI components (`@opencode/ui/*`) are
retained from upstream under MIT.

---

## 2. Repository layout

Bun workspaces + Turborepo. Workspaces: `packages/*`, `packages/plugins/*`, `services/*`,
`packages/stats/*`.

Top-level directories of interest:

| Path | Role |
|---|---|
| `packages/core` | Domain engine: sessions, providers, tools, permissions, MCP, config, persistence. **Deep-read.** |
| `packages/schema` | Shared wire + storage contracts (Effect Schema). **[PENDING]** |
| `packages/protocol` | Public API definitions (HttpApi / OpenAPI). **[PENDING]** |
| `packages/server` | HTTP server + runtime composition. **[PENDING]** |
| `packages/client` | Generated TypeScript clients (promise + effect). **[PENDING, generated]** |
| `packages/sdk` | Composes Client + Core + Server. **[PENDING]** |
| `packages/cli` | CLI entrypoint + service lifecycle. **[PENDING]** |
| `packages/ai` | Provider/model streaming abstraction (`@opencode/ai`), native provider packages. **[PENDING]** |
| `packages/tui` | Terminal interface (OpenTUI + Solid). **[PENDING]** |
| `packages/app` | Shared web interface (SolidJS). **[PENDING]** |
| `packages/desktop` | Electron desktop shell. **[PENDING — egress lives here/gui-plugins]** |
| `packages/gui-plugins` | Built-in GUI plugins (terminal, ssh, wsl, review, browser, updater, …). **[PENDING]** |
| `packages/ui`, `session-ui`, `theme`, `stories` | UI kits + theme + storybook. **[PENDING]** |
| `packages/plugin` | Plugin API / SDK (Effect + promise adapters, host, source). **[PENDING]** |
| `packages/codemode` | Code Mode interpreter/stdlib (run tools via code). **[PENDING]** |
| `packages/util` | Shared utilities (fs-util, effect app-node/layer-node, process, npm, hash, …). **[PENDING]** |
| `packages/{http-recorder,httpapi-codegen,patchmark,merman,latex,plugin-browser,identity,simulation,stats,function,process-daemon,effect-drizzle-sqlite,script,plugins,web}` | Smaller/specialized packages. **[PENDING]** |
| `sdks/vscode` | VS Code extension. **[PENDING]** |
| `services/{files,site,update}` | Cloudflare/hosted services. **[PENDING]** |
| `infra` | SST infra (app/console/share/stage/stats/webapp). **[PENDING]** |
| `script`, `scripts`, `nix`, `salesforce`, `specs`, `patches` | Build/release tooling, lint rules, specs. **[PENDING]** |

**Dependency direction (enforced by `AGENTS.md`):** Schema → Core & Protocol → Server. Client
runtime may depend on Schema & Protocol but **never** Core or Server; `sdk` composes Client, Core,
Server. After changing public Protocol/Server HttpApi, run `bun run generate` from
`packages/client`; never edit generated client files by hand.

**Generated files (`.gitattributes` `linguist-generated`):** `core` migration snapshots,
`core/src/database/migration.gen.ts`, `core/src/database/schema.gen.ts`,
`core/src/models-dev/snapshot.txt`, `desktop/src/main/storage/migration.gen.ts`,
`protocol/openapi.json`, `client/src/{promise/generated,effect/generated,effect/api}/**`.

---

## 3. Tech stack & engineering conventions

- **Runtime/build:** Bun 1.4.4+, Turborepo, Node 22+ for packaging. TypeScript via
  `npm:@typescript/typescript6` and `@typescript/native` (TS 7 beta). `bun check` for local
  typecheck, `tsc` (`typecheck:tsc`) is source of truth in CI.
- **Effect (Effect-TS)** is the backbone of `core`: `Effect`, `Layer`, `Context.Service`,
  `Schema`, `Stream`, `Scope`, `Fiber`, `PubSub`, `Deferred`, `Semaphore`, `Schedule`, `Cron`,
  `DateTime`, `Cache`, `LayerMap`/`RcMap`. Services are composed as a dependency graph.
- **Persistence:** Drizzle ORM over SQLite (`@effect/sql-sqlite-bun` / `-node`, plus a Cloudflare
  Durable Object / workerd adapter). WAL mode, owner-only file perms.
- **Frontend:** SolidJS (`app`, `tui` via `@opentui/solid`), OpenTUI for the terminal, Kobalte/Corvu
  primitives, Tailwind 4. Desktop is Electron. Docs/site use Astro + Starlight.
- **HTTP:** `effect/http` (`HttpClient`, `FetchHttpClient`), Hono on the server side.
- **Lint:** `oxlint` with custom JS plugins (`anti-slop`, `anti-slop-effect`) + `ast-grep` rules
  enforcing the style guide (no import aliases, no star imports, no nested service yields, Drizzle
  snake_case columns, no `JSON.parse` casts, etc.). GUI plugins may not import `app`/`desktop`
  internals; they use the SDK, and may not use `createEffect`/`createRenderEffect`/`createComputed`
  directly (they use SDK helpers like `createKeyed`, `createLatest`, `createVisitState`).
- **Style guide (`AGENTS.md`):** validate once at the boundary; avoid `try`/`catch` and `any`;
  prefer Bun APIs; rely on inference; functional array methods; `const` + early returns, avoid
  `else`; no unnecessary destructuring; no import aliases/star imports; prefer dynamic import for
  heavy modules; inline single-use values; Effect generators bind services to named variables
  before calling methods; comments only for non-obvious constraints.
- **Feature flags:** `packages/schema/src/config/flag.ts`, read via `Flag.enabled("<key>")`. On in
  local/dev, off in releases; `experimental.<key>` and `OPENCODE_FLAGS="key,-other"` override.
- **Experimental API:** routes under `/api/experimental/<group>/...`, identifier
  `experimental.<group>.<method>`, SDK `client.experimental.<group>.<method>`. New endpoints start
  experimental.
- **Testing:** avoid mocks; test real implementation; tests run from package dirs (root guard
  `do-not-run-tests-from-root`). Skills in `.opencode/skills` for unit/tui/app-e2e/component tests.
- **Branch/commit conventions:** default branch `dev`; short hyphenated branch names (≤3 words, no
  slashes); conventional commits `type(scope): summary`.

---

## 4. Core architecture (the engine)

`packages/core` is an Effect service graph implementing the whole domain. The central ideas:

### 4.1 Service graph, Instances, and Locations

- Every domain capability is an Effect `Context.Service` with a `Layer`, wrapped as a **node**
  (`makeGlobalNode` / `makeLocationNode` from `@opencode/util/effect/app-node`). Nodes declare
  `deps`, forming a compile-time graph (`LayerNode`).
- **`Instance`** (`instance.ts`) = "one compiled, fresh copy of the graph standing on a directory."
  `Instance.layer(ref, options)` compiles the big node `graph` (Location, Config, Agent, Provider,
  Model, Tool, Permission, Mcp, Session, FileSystem, Shell, Skill, Snapshot, Vcs, Worktree, …) with
  ordered **replacements**: vanilla defaults → caller replacements → instance bindings (Location +
  InstancePlugins). `discovery:false` boots "vanilla" (no upward config scan / global dir / plugin
  dir / boot-time AGENTS.md). A missing directory is an expected `FileSystem.DirectoryNotFoundError`;
  other boot failures are defects.
- **`Location`** = `{ directory, workspaceID?, project, vcs? }`. `Location.Ref` identifies a
  placement; `LocationServiceMap.canonical` normalizes paths (Windows/POSIX flavor, trailing sep).
- **`LocationServiceMap`** (`location-services.ts`) is a `LayerMap<Location.Ref, Instance.Services>`
  that builds/caches one service graph per location, with `get`, `contextEffect`, `invalidate`,
  `reload`. Healthy graphs are retained (`idleTimeToLive: infinity`); boot failures evict. Cached
  instances borrow their owner via an `Instance` replacement. Shutdown closes all locations
  concurrently; a held location logs a warning after 30s.
- **`LocationLifecycle`** provides `isClosed`, `shutdown`, `awaitShutdown`, `retain`/`isRetained`
  (ref-counted so open client connections keep a location alive). Shutdown closes permissions,
  forms, rpc, and publishes `LocationEvent.Shutdown`. It also activates the project on durable
  session events.
- **`Instance.Service`** (`instance/service.ts`) is the selector: `provide(session)` supplies a
  session's location services to an effect; `live?` reports whether it would reuse built/booting
  capabilities.

### 4.2 The `State` system (`state.ts`)

A synchronous, replayable domain-state mechanism used by nearly every catalog (agents, providers,
models, tools, MCP, compaction, snapshot, shell-select, vcs, websearch, artifact, worktree, …):

- `State.create({ initial, editor, notify })` returns `{ get, invalidate, revision, transform,
  reload }`. Reads **rebuild** by applying every registered transform in order to a fresh
  `initial()` value wrapped in a domain `editor`.
- `transform(callback)` registers a scoped edit (`Scope` finalizer removes it). Transforms can be
  **grouped** (`State.group(report)`): if a grouped transform throws, the whole group is detached
  synchronously and the supervisor refreshes — this is how a failing plugin is disabled without
  taking down the rest.
- `State.batch` coalesces notifications until the effect completes; `State.shutdown` closes states
  permanently. `State.changes(project, notify)` only notifies when the serialized projection
  differs. `State.reconcile` runs notification work in the owning layer's FiberSet so it is
  interrupted with the layer.
- This gives plugin/config code a concise mutable-editor API while reads stay pure/replayable and
  derived state is rebuilt deterministically.

### 4.3 The event `Bus` (`bus.ts`) — event sourcing

- Events are **durable** (versioned, per-aggregate, sequenced) or **ephemeral**. Definitions come
  from `@opencode/schema` (`Event.durable` / `Event.ephemeral`, `Durable` manifest).
- `publish(definition, data, options)` / `publishAll([...])`:
  - Durable events run in a per-aggregate `KeyedMutex` and a SQLite **transaction**
    (`behavior:"immediate"`). They reserve/advance `event_sequence.seq`, run **projectors**
    inline, run an optional atomic `commit(seq)` hook (local operational projection), and
    optionally persist the payload to `event` (when `persist:true`).
  - `options.location` / ambient `Location` routes events; `prepareRoutes` tracks session→location
    ownership (created/forked/moved/deleted) so live delivery is location-scoped. Moves reach both
    old and new location.
  - Replay (`replay`) re-commits a serialized event at a given seq with owner checks
    (`strictOwner`), detecting divergence; legacy payload shapes are upgraded via `SessionLegacy`.
- `subscribe()` (live, location-filtered), `subscribe(defs)` (typed), `log({aggregateID, after,
  follow})` (durable ordered replay then live, emits a `log.synced` watermark marker), `project`
  (register projector), `listen` (deprecated), `remove`, `claim`.
- This is the backbone of **event-sourced sessions**: durable facts are minimal; projections/read
  models are enriched by folding ordered history (per `AGENTS.md` "Session Core").

### 4.4 Session Core design rules (from `AGENTS.md`)

- Durable events record irreducible new facts; don't repeat state derivable by folding history.
- **Prompt admission is separate from model execution.** `Session.prompt` publishes
  `session.inbox.enqueued` (projection inserts one `session_inbox` row) then schedules advisory
  `SessionExecution.wake` unless `resume:false`. Delivery publishes `session.inbox.delivered`
  (projection consumes the inbox row and inserts the visible message in the same transaction).
  `session_inbox` stores only unconsumed work.
- Reusing a Session ID adopts it; reusing a user/synthetic inbox item ID is idempotent when Session
  + type match (first admission wins). Cross-session/type reuse fails.
- `SessionExecution` is process-global and Session-ID based; `SessionRunner`, model resolution,
  tool registry, permissions, filesystem are Location-scoped.
- **Each step is one explicit `llm.stream` call** continuing from reloaded history — no in-memory
  tool loop.
- Local drains are process-local; `SessionRunCoordinator` joins same-session resumes, coalesces
  wakeups, allows different sessions to run concurrently. A **write-ahead execution claim** marks a
  busy period for restart recovery.
- Delivery vocabulary: prompts **steer** by default; at safe step boundaries steered compaction has
  priority up to the first steered move; at idle, steers take priority else exactly one queued item
  delivers. Promoting new user input resets the agent's step allowance.
- "Step" = one logical LLM call; "turn" is reserved for the future assistant-turn unit.

---

## 5. Session subsystem (deep)

The session domain is event-sourced and split across many focused modules.

### 5.1 Facade & handles
- **`session.ts` (`Session`)** is the public service: `create`, `fork`, `get`, `list`, `messages`,
  `message`, `messagesWithRefs`/`messageWithRefs` (experimental media-blob), `context`, `diff`,
  `inbox`/`inboxWithRefs`, `cancelInbox`/`steerInbox`/`queueInbox`, `log`, `switchAgent`,
  `switchModel`, `rename`, `archive`/`unarchive`, `setMetadata`, `setPermissions`, `move`, `prompt`,
  `generate`, `command`, `shell`, `skill`, `compact`, `wait`, `active`, `background`, `resume`,
  `interrupt`, `synthetic`, `revert.{stage,clear,commit}`.
  - `create` publishes `SessionEvent.Created` (with project resolution, slug, location, subpath,
    inherited metadata/permissions for children); handles the projection race via
    `SessionAlreadyProjected`.
  - `fork` finds a boundary message, inherits current instruction values/entries, publishes
    `SessionEvent.Forked` with `ForkMedia` (whether to externalize copied media).
  - `remove` interrupts, awaits idle, cancels jobs, closes transport, recursively removes children,
    clears environment, publishes `Deleted`, removes the bus aggregate.
- **`session/session.ts` (`Session.make`)** builds per-session **handles** (`forSession(id)`) that
  share host services. Implements prompt admission (`reconcile` → `prepare` → commit staged revert
  → `admit` → `wake`), `shell` (server-owned completion), `skill`, `compact`, `synthetic`,
  `interrupt`, `revert`, view/rename/archive/metadata/permissions/switchAgent/switchModel.

### 5.2 Durable events & projection
- **`SessionEvent`** (from `@opencode/schema/session-event`) enumerates the durable vocabulary:
  `session.created/forked/deleted/moved/renamed/archived/unarchived/viewed/metadata.updated/
  permissions/agent.selected/model.selected`, `session.inbox.enqueued/delivered/cancelled/
  delivery.changed`, `session.execution.started/succeeded/failed/interrupted`,
  `session.instructions.updated`, `session.synthetic`, `session.skill.activated`,
  `session.shell.started/ended`, `session.step.started/streamed/ended/failed`,
  `session.text.started/ended` (+delta), `session.reasoning.started/ended` (+delta),
  `session.tool.input.started/ended`, `session.tool.called/success/failed/progress`,
  `session.retry.scheduled`, `session.compaction.started/ended/failed` (+delta),
  `session.revert.staged/cleared/committed`, `session.usage.recorded`, `session.message.content.updated`.
- **`session/projector.ts` (`SessionProjector`)** registers `bus.project` handlers that write the
  read model: `session_v2`, `session_message`, `session_part`, `session_inbox`, instruction tables,
  blob refs. It applies usage, idle outcomes, viewed watermarks, fork copying (batched, settled
  history only), revert commit (delete messages/inbox ≥ boundary, rewind instructions, release
  blobs), worktree-resolution adoption. Supports an experimental `part_rows` mode (assistant parts
  as rows) vs whole-message rewrite; both keep blob refs in sync. Publishes `UsageUpdated` on
  step-end/fail/usage-recorded.
- **`session/message-updater.ts`** is the pure event→message reducer (`Match.discriminatorsExhaustive`
  on `type`) used by the projector via an `Adapter` (get/update assistant, append/update/replace
  parts, shell, compaction, appendMessage). It projects step lifecycle, text/reasoning/tool parts,
  retry, compaction, idle, agent/model/location switches, instruction updates.
- **`session/sql.ts`** defines the Drizzle tables: `session_v2`, `session_message`, `session_part`,
  `session_inbox`, `instruction_entry`, `instruction_blob`, `instruction_state`, `blob`, `blob_ref`
  (with indexes and cascade FKs). `time_suspended` is the historical name for the execution claim.

### 5.3 Storage, history, media
- **`session/store.ts` (`SessionStore`)**: Drizzle reads (`get`, `list` with cursor/anchor,
  `messages`/`context`/`message`, `WithRefs` variants), and the **execution claim** bookkeeping:
  `listSuspended`, `claim`, `release`, `releaseChildClaims`, `countResume`. Claim pins
  `time_updated` so ordering only moves on real activity.
- **`session/history.ts` (`SessionHistory`)**: loads history from the latest completed compaction
  boundary; `Boundary = "latest" | "local" | Model.Ref`. Native provider compaction windows replay
  only on the model that made them. `withParts` folds `session_part` rows into assistant content;
  blob hydration restores media; `withRecentText` rebuilds the verbatim recent part of a summary
  from `metadata.keepID`. Also `entriesForRunner`, `preview`, `synthetics`, `incompleteAssistants`,
  `firstUserMessage`.
- **`session/blob.ts` (`SessionBlob`)**: experimental `media_blob` externalization. Inline user
  files / tool `data:` files move into a content-addressed `blob` table (SHA-256), referenced as
  `media:<hash>`. Ref-counting via `blob_ref`; `hydrate`/`keepRefs`/`read`/`externalize`/`split`/
  `recordRefs`/`syncRefs`/`release*`. Unreferenced blobs are swept; a missing blob reads as
  `[media unavailable]`.
- **`session/stored.ts`**: stored-row shapes where files may be `media:` refs.
- **`session/info.ts`**: `fromRow` maps a `session_v2` row to `Session.Info`.

### 5.4 Execution & scheduling of work
- **`session/execution.ts` (`SessionExecution`)**: process-global router from Session ID to the
  selected instance's runner. Uses `SessionRunCoordinator` with `started`/`drain`/`settled` hooks
  that publish `Execution.Started/Succeeded/Failed/Interrupted` and **claim/release** the durable
  execution claim atomically (`claimOnCommit`/`releaseOnCommit`). Shutdown interruption preserves
  the claim for restart continuity; user interruption releases it. `interrupt(...,{resume})` can
  re-wake steer/control work.
- **`session/run-coordinator.ts` (`SessionRunCoordinator`)**: the **doorbell** pattern. One fiber
  per busy period per key; `pendingWake` coalesces new work (widest scope wins: `input` subsumes
  `steer`); `run` joins, `wake` rings, `interrupt` stops (acknowledges before cleanup settles),
  `awaitIdle` resolves when idle. A late doorbell starts a successor execution. Trampolined to avoid
  stack growth.
- **`session/execution/restart.ts` (`SessionRestart`)**: recovery sweep for orphaned claims
  (process died without teardown, or graceful shutdown). Per-turn durable **resume budget**
  (`maxAttempts`, default 10) — a crash-looping turn is terminalized instead of resuming forever.
  Recovers background shell/image/subagent jobs and re-wakes sessions whose scheduled prompt is
  still pending. Assumes one managed server per database.
- **`session/inbox.ts` (`SessionInbox`)**: durable admission. `reconcile`/`admit`/`admitCompaction`,
  `cancel`/`steer`/`queue` (delivery changes), and projections (`projectAdmitted/Delivered/
  Cancelled/DeliveryChanged`). `promote(scope)` consumes pending rows into visible messages:
  steers first; steered compaction takes priority up to the first move; only `input` scope may fall
  through to one queued item. Control items = compaction/move. `nextPromotable`, `has`, `moveIDs`.
- **`session/background.ts`**: outstanding background jobs for a session or descendants.
- **`session/subagent-job.ts` / `subagent-completion.ts`**: background subagent jobs + completion
  delivery into the parent as a `<subagent ...>` synthetic.

### 5.5 The LLM step loop
- **`session/runner/index.ts` (`SessionRunner`)**: interface `drain(...)` returning
  `DrainResult = Complete | Moved | Reloaded`; `RunError` union; `Continuation={step}`.
- **`session/runner/llm.ts` (`SessionRunnerLLM`)**: `drain` = one turn. `advanceToStep` handles
  location-closed reload, pending controls (compaction/move), promotion, idle hook
  (`experimental.idle`), and context preparation. `runStep` is the retry/compaction loop: estimate
  prompt → auto-compact → build transcript → `context.request.primary` → `steps.attempt` → match
  outcome (`Completed/Retry/Continue/OutputLimit/Compacted/RecoverFull`). Handles max-steps prompt,
  output-limit continuation streaks, stale compaction/tool settlement on restart.
- **`session/runner/step.ts` (`SessionStep`)**: `attempt` streams `llm.stream`, publishes events via
  the publisher, runs local tools in scoped fibers, joins them, classifies declines/interrupts/
  failures, recovers overflow via compaction, captures start/end snapshots + changed files, records
  usage, and publishes `Step.Ended`/`Step.Failed`. Returns a typed `Outcome`.
- **`session/runner/publish-llm-event.ts`**: the concurrency-safe durable writer. `StepRecord` is an
  immutable fold (outputStarted/providerFailed/failure/finish/needsContinuation). Two invariants:
  (1) check-and-mark is atomic (no yield between check and mark); (2) no cross-source event order
  required (each fiber sequential; consumers fold by id/ordinal). Batches text/reasoning/tool-input
  deltas on a 100ms timer; handles malformed/incomplete tool input, hosted vs local tool results.
- **`session/runner/to-llm-message.ts`**: lowers projected history to `@opencode/ai` `Message`s.
  Provider-metadata replay is model-scoped (Gemini thought signatures, OpenAI encrypted reasoning
  only replay on the producing model); hosted-tool native data is provider-scoped. Handles
  compaction checkpoints, model/agent/location switches, shell/skill/synthetic/system messages.
- **`session/runner/model.ts` (`SessionRunnerModel`)**: resolves the session/agent model; errors
  `ModelNotSelectedError`/`ModelUnavailableError` (with deprecated-provider hints).
- **`session/runner/retry.ts`**: retry policy wrapper publishing `RetryScheduled` and sleeping.
- **`session/runner/max-steps.ts`**: the `MAX_STEPS_PROMPT` (tools disabled, text-only summary).
- **`session/model-request.ts` (`SessionModelRequest`)**: builds requests for
  `primary/compaction/generate/title`. Runs plugin hooks (`session.context/compaction/generate/
  title`), tracks tool definitions by identity (hooks may rename), bounds images
  (`IMAGE_BYTES_TRIGGER/TARGET`), removes unsupported media, fits output limits
  (`outputLimit`, `WINDOW_HEADROOM`), sets affinity/cache headers, and wires HTTP + WebSocket hooks.
  `executeTool` recovers permission declines from the defect channel.
- **`session/model-transport.ts` (`SessionModelTransport`)**: per-session WebSocket channel with
  affinity-keyed reuse, rotation (affinity change / age 55min), connect/idle timeouts, HTTP fallback
  after repeated failures or oversized requests, checkpoints, and delivery semantics
  (`not-sent`/`ambiguous`/`accepted`/`rejected`).

### 5.6 Context management & compaction
- **`session/context.ts` (`SessionContext`)**: two-phase resolution — `select` (session, agent,
  instruction sources, tool snapshot) then `load` (model + active history). Combines instructions
  most-shared-first for prompt-cache reuse (CodeMode catalog, MCP, references, skills, discovery,
  builtins, entries). `selectTitle` picks a small/low-reasoning model.
- **`session/compaction.ts` (`SessionCompaction`)**: `auto`/`manual`/`overflow` triggers;
  `precompute` background summaries (cache-aware, held until due); native provider compaction;
  summary template + rules; progressive transcript shrinking (`SHRINK_STEPS`, flatten levels);
  token estimation (`estimatePrompt`, measured anchor + estimated tail); ceiling/buffer math;
  bills compaction usage. `Settings={auto,buffer,keep,precompute}`.
- **`session/instruction-state.ts` / `instruction-entry.ts` / `instructions.ts`**: instruction
  epoch/baseline tracking (`instruction_state`, `instruction_blob`, `instruction_entry`), API
  context entries (`api/<key>`), and AGENTS.md injection on read (dedup ledger via synthetic
  metadata). `InstructionState.prepare/commit/apply/advanceEpoch/rewind/initial/preview`.
- **`session/recent-text.ts`**: renders the verbatim recent part of a summary; tool-output truncation.

### 5.7 Auxiliary session services
- **`session/title.ts`**: generates/regenerates titles from bounded history (utility model).
- **`session/diff.ts`**: structured per-file diffs of a turn/range via start/end snapshots; rejects
  ranges spanning a location change.
- **`session/move.ts`**: move a session to another directory at a safe boundary (admits a `move`
  control, or recovers placement when the source is unavailable).
- **`session/revert.ts`**: snapshot-based undo — `stage` (restore files to a message boundary),
  `clear`, `commit` (publishes `Revert.Committed`).
- **`session/transfer.ts`**: export/import sessions; `sanitize` redacts content for sharing.
- **`session/stats.ts`**: usage analytics (prompts/steps/tokens/cost/tools/activity/streaks/models)
  over a time range, fork-aware.
- **`session/generate.ts` / `command.ts` / `environment.ts` / `affinity.ts` / `shell.ts` /
  `skill.ts` / `system-prompt.ts` / `usage.ts` / `to-session-error.ts`**: stateless generation,
  command execution, per-session env vars, cache-affinity grouping, user shell commands, skill
  activation, system-prompt rendering, usage/cost math, and AI-error→session-error mapping.

---

## 6. Tool system

- **`tool.ts` (`Tool`)**: a `State`-based registry. `snapshot(permissions)` filters wholly-disabled
  tools, splits CodeMode vs direct tools, builds the CodeMode `execute` tool + catalog, and returns
  `definitions` + an `execute` function. `execute` runs `execute.before` hook → tool → 
  `execute.after` hook → normalize content/images. Registration validates name/schema; namespaces.
- **`tool/runtime.ts`**: `definition`/`execute`; validates input via Standard Schema / Effect Schema
  / raw JSON Schema; enforces the declared `Tool.Error` contract at the untrusted boundary;
  normalizes content; converts schemas to JSON Schema (flatten `allOf`, inline local `$ref`, drop
  safe-integer bounds to keep prompt caches stable).
- **Built-in tools** (`tool/plugin/*`), each a plugin registering via `ctx.tool.transform`:
  - **`shell`**: runs a command via the `Shell` service; per-command permission from `ShellParse`;
    background mode + auto-notification; timeout; output truncation to file.
  - **`read`**: reads file/dir/image/PDF; line-numbered text; injects nearby `AGENTS.md`; supports
    `skill://` virtual files; fuzzy filename recovery; helpful "did you mean" errors.
  - **`write` / `edit`**: file mutation with external-directory + edit approval. `edit` does exact
    match with CRLF preservation, LCS line-ending alignment, unicode/trailing-whitespace fallback
    tiers, and miss hints. `patch` does multi-file add/update/delete (used for GPT models instead of
    edit/write).
  - **`glob` / `grep`**: ripgrep-backed search with limits/timeouts.
  - **`webfetch`**: fetch URL as text/markdown/html; checks permission per redirect; bounded body;
    HTML→markdown.
  - **`websearch`**: uses the selected web-search integration; prompts to choose/enable a provider
    if none.
  - **`question`**: interactive form; dismissal tunnels as a defect (ends step) unless it carries
    feedback.
  - **`todowrite`**: todo list (flag-gated).
  - **`skill`**: load a skill's instructions/resources.
  - **`subagent`**: spawn/continue a child session; depth limit; foreground/background; model override.
  - **`experimental_image_generate`**: background image generation/edit job.
  - **`artifact_*`**, **`schedule_*`**, **`opencode.*`** (session_rename/move, worktree_*, models),
    **`list_mcp_resources` / `read_mcp_resource`**.
- **`tool/mcp.ts` (`McpTool`)**: bridges MCP server tools into the registry (namespaced, permission
  per tool, content conversion, debounced reconcile on `ToolsChanged`).
- **`tool/read-filesystem.ts`**: the read tool's filesystem/media paging logic.
- **`tool/html-markdown.ts`**, **`tool/http-body.ts`**, **`tool/search.ts`**, **`tool/file-diff.ts`**:
  HTML→markdown, bounded HTTP body collection, bounded search, diff construction.
- **`tool-output.ts` (`ToolOutput`)**: truncates oversized tool output to a retained file
  (max lines/bytes), `save` for binary output, hourly cleanup.
- **`plugin/tool-input-repair.ts`**: repairs model tool input (stringified JSON/objects/arrays,
  numeric/boolean strings, null placeholders, tuples, dictionaries) against the input schema;
  aliases `bash`→`shell`.

---

## 7. Permission system

- **`permission.ts` (`Permission`)**: wildcard rules `{action, resource, effect: ask|allow|deny}`.
  `evaluate` = last matching rule (default `ask`); `merge` flattens rulesets. Configured =
  agent permissions + session permissions; saved project rules added for `allow`. A plugin
  `permission.evaluate` hook can change the effect; **Unattended** rules settle asks for
  unattended work (else deny).
  - `assert` denies (`BlockedError`), allows, or creates a pending request and awaits a reply.
    **Decline tunnels as a defect** (`DeclinedError` → `Effect.die`) so tool wrappers can't turn a
    "no" into model-visible output; it resurfaces as a typed failure at
    `SessionModelRequest.executeTool`. A decline **with feedback** (`CorrectedError`) stays typed so
    the model can continue.
  - `reply` supports `reject` (batch-rejects the session's pending), `once`/`always` (always saves
    the `save` resources and auto-approves matching pending).
- **`permission/saved.ts`**: persisted project allow-rules. **[read]**
- **`file-access.ts` (`FileAccess`)**: resolves a path to a `Target` (internal location-relative
  resource, or external with an `external_directory` approval boundary). `authorizeExternal`,
  `authorizeRead`. Expands `~`, normalizes Windows shell paths.
- **`managed-policy.ts` (`ManagedPolicy`)**: organization/config policy statements
  (`provider.use`, `integration.use`, `mcp.use`, `skill.use`, `websearch.use`, `tool.use`),
  earliest-loaded wins; `integrationResource` = `<integration>#<account>`; denial messages name the
  organization. Enforced by `config/plugin/policy.ts`.

---

## 8. Provider & model system

- **`provider.ts` (`Provider`)**: `State` catalog of provider definitions + models. Native builtin
  packages (`@opencode/ai/providers/*`) loaded by name; npm packages installed/resolved; `aisdk:`
  prefix for AI-SDK providers. Settings/headers/body deep-merge; timeouts
  (`headerTimeout` 300s, `chunkTimeout` 900s defaults); availability gated by integration connection
  + activation. `AISDKNative.rewrite` normalizes legacy package spellings.
- **`model.ts` (`Model`)**: `State` catalog; merges provider settings into models; separates chat vs
  image/decision; `preferFree` ordering; `small(provider)` picks a utility model by family
  (gpt-luna/gemini-flash-lite/flash/claude-haiku); `default`.
- **`model-resolver.ts` (`ModelResolver`)**: resolves a catalog selection to a runtime
  `LanguageModel` (native package `model(modelID, settings)` or AI-SDK bridge). Variant overlays,
  credential injection (key/oauth/external), `${VAR}` baseURL substitution, compaction-policy
  validation, `Auth.none` for enabled providers with no credential. Typed errors
  (Variant/UnsupportedPackage/ModelConfiguration/ModelInitialization/UnresolvedVariables/
  UnsupportedCompaction).
- **`model-retry.ts` (`ModelRetry`)**: exponential backoff (2s→10s cap, 10 retries, jitter),
  retry-after capped at 15min; a separate **unreachable-network budget** (up to 1h); timeout retries
  capped; `retryOneShot` for stateless calls (only retry failures the provider never ran).
- **`aisdk.ts` (`AISDK`)**: bridges AI-SDK `LanguageModelV3` to the native route. Custom `fetch`
  with header/chunk/total timeouts (SSE wrap), HTTP-hook middleware via `AsyncLocalStorage`,
  prompt/tool lowering, stream-part→`LLMEvent` conversion, usage/finish mapping, error
  classification (APICallError / network codes).
- **`aisdk-native.ts`**: rewrites `@ai-sdk/*` to native `@opencode/ai/providers/*` with
  provider-specific settings translation (Bedrock SigV4/Converse/thinking, OpenRouter headers,
  Azure chat vs responses, Mantle, Vertex).
- **Provider plugins** (`plugin/provider/*`) register integrations + transform provider/model
  catalogs. Read in full:
  - **`opencode`**: OpenCode Console device OAuth, org/SSO handling, remote config + library
    (instructions/skills) sync, hosted web search, free-tier gating, usage budgets.
  - **`openai`**: Codex browser (PKCE loopback) + device-code legacy; ChatGPT plan model gating,
    zstd + websocket transport, session-affinity headers.
  - **`chatgpt`**: token-sharing sign-in (dynamic client registration, PKCE + nonce + ID-token
    verification via jose), model fallback set, non-retryable sharing codes.
  - **`github-copilot`**: device OAuth (github.com / enterprise), entitlement check, live model
    discovery, per-model endpoint routing (responses/chat/messages), utility title model,
    interaction-type headers.
  - **`gitlab`**: PKCE OAuth, single-flight token refresh, Duo workflow/agentic model discovery.
  - **`azure`**: Entra ID via Azure CLI, Resource Graph + deployment discovery, resource-name URL
    expansion, per-request bearer injection.
  - **`google-vertex`**: ADC/gcloud config discovery, project/location resolution, URL templating.
  - **`amazon-bedrock`**: AWS profile/SigV4 default chain, region defaults, bearer-token env.
  - **`snowflake-cortex`, `digitalocean`, `xai`, `poe`, `cloudflare-ai-gateway`,
    `cloudflare-workers-ai`, `openrouter`, `sap-ai-core`, `databricks`, `neon`, `nvidia`, `kilo`,
    `llmgateway`, `zenmux`, `cerebras`**: mostly integration methods + header/URL transforms.
  - **`local`/`ollama`/`lmstudio`/`vllm`**: local OpenAI-compatible server discovery factory.
  - **`modal`**: Modal model discovery. **`dynamic`**: npm SDK factory loader.
    **`prompt-cache-key`**, **`openai-context-caps`**: compatibility/caps.
  - **`claude-agent/*`**: wraps the local `claude` binary / Claude Agent SDK as a model. Session
    registry with process lifecycle, tool-result "parking", fork/catch-up transcript sync
    (fingerprint-based), version probe, isolation env (disables Claude's own memory/compaction so
    OpenCode's wins), and an MCP tool-server bridge so Claude calls OpenCode tools.
- **`plugin/models-dev.ts`**: loads the models.dev catalog, registers integrations/providers,
  filters deprecated/profile-only models.
- **`models-dev.ts`, `variant.ts`, `modal/models.ts`, `github-copilot/*`**: catalog/variant/Copilot
  SDK internals. **[PENDING — not yet read]**

---

## 9. Plugin system

- **`plugin.ts` (`Plugin`)**: the registry. `activate(plugins, failures)` does an index-aligned
  prefix diff on (id, revision); unchanged prefix stays, changed suffix is torn down/reloaded in a
  `State.batch`. A failed revision isn't retried until it changes; a healthy fallback can be
  restored. Grouped `State` failure disables a plugin asynchronously. Exposes `list`, `gui`
  (reads a plugin's `./gui-experimental` bundle), `awaitActivation`, `hold`, `close`.
- **`plugin/host.ts` (`PluginHost.make`)**: builds the large `ctx` object given to each plugin,
  exposing scoped domains: `app, location, rpc, agent, aisdk, provider, model, command, credential,
  event, experimental (terminal/generate/artifact), generate, integration, mcp, permission, plugin,
  reference, skill, storage, shell, tool, vcs, websearch, worktree, session`. Each domain wraps the
  corresponding core service with plugin-safe semantics (location routing, transforms, hooks).
- **`plugin/hooks.ts` (`PluginHooks`)**: domain/name hook registry
  (`aisdk, session, permission, shell, tool`), providerID-scoped; only `tool.execute.before` may fail
  (rejects the call). `trigger` folds the event through callbacks.
- **`plugin/internal.ts`**: the internal plugin list (`pre` then `post`), the `requirements` service
  graph, and `guarded` IDs (Console + policy can't be removed by repo config). Ordering matters:
  tool-input-repair, config worktree/mcp, wellknown, vcs, agent, plan, command, goal, skill,
  models-dev, providers, websearch, patch, optimize, verbosity, identity, then the tools, then post
  config plugins + dynamic provider + policy.
- **`plugin/module.ts`**: loads npm/local plugins, resolves entrypoints (server/tui/gui/rpc),
  watches local sources + GUI bundle, computes revisions, enforces `plugin.use` policy.
- **`plugin/supervisor.ts`**: resolves config plugin operations (add/remove, wildcards), combines
  internal + SDK + instance + package plugins, activates, checks updates.
- **`plugin/service.ts`, `instance.ts`, `update.ts`, `promise.ts`, `source-directory.ts`**: service
  tag, per-instance birth plugins, npm update checks, promise-plugin adapter, plugin dir discovery.
- **Built-in behavior plugins** (read): `agent` (Build/General/Explore/Title/Summary/Compaction),
  `command` (init/review/MCP prompts), `goal` (autonomous objective loop with a judge + stall
  detection), `plan` (read-only mode reminders), `identity`, `optimize` (model-specific system
  prompts), `verbosity`, `warming` (cache keep-alive), `skill` (opencode/report), `models-dev`,
  `mcp-codemode-defaults`, `tool-input-repair`, `vcs/git`, `vcs/hg`, websearch providers.
- **Config-driven plugins** (`config/plugin/*`, read): agent/command markdown loading, compaction,
  compatibility (`.claude`/`.agents` skills), formatter, image, instruction (AGENTS.md + remote
  URLs), location-watcher, mcp, policy, provider, reference, shell, skill, snapshot, source,
  tool-output, websearch, worktree. These observe config changes and transform the matching service.

---

## 10. MCP (Model Context Protocol)

- **`mcp/index.ts` (`Mcp`)**: server lifecycle. Config-driven `State` of servers; `reconcile`
  boots/replace/remove; per-server locks; pooling (`McpPool`) for shareable connections; registers
  remote servers as OAuth integrations; elicitation forms (Location-scoped); attached client-hosted
  connections (stacked by name); `tools/resources/prompts/readResource/callTool`, `awaitStartup`
  (bounded grace), `instructions`. Publishes `StatusChanged/ToolsChanged/ResourcesChanged/
  PromptsChanged`.
- **`mcp/client.ts` (`McpClient`)**: wraps `@modelcontextprotocol/client`. Protocol negotiation
  (legacy vs modern `2026-07-28`), roots, elicitation handlers, list-changed callbacks, tool
  validation/sanitization, session-expiry detection, `codemode=false` query handling, transient
  retry, bounded responses.
- **`mcp/connection.ts` (`McpConnection`)**: one server connection, reconnect-in-place, `recovering`
  (retry once after session expiry), catalog reads, per-endpoint handshake turn-taking.
- **`mcp/pool.ts` (`McpPool`)**: process-global sharing of identical connections across Locations.
  A **key** fingerprints everything that could change behavior — protocol, timeout, clientInfo,
  and (remote) URL + header/oauth fingerprints + credential ID + codemode flag, or (local) command
  + resolved cwd + environment fingerprint; secrets appear only as `SharedCache.fingerprint`
  hashes, and the server *name* is excluded (each Location keeps its own). A **slot** holds one
  connection + a set of **holders**; the first holder opens it, the last to release closes it
  (interrupting a start nobody waits for). A server that **negotiates legacy** or **refuses the
  pooled handshake** is marked `unpoolable` for the process life: every later start for that key
  connects privately (legacy keys skip the modern probe). Elicitation tied to a request reaches
  that request's Location; an untied one races all holders, first answer wins, others' forms are
  cancelled. Local servers with no fixed `cwd` are warned once and keyed per-directory.
- **`mcp/stdio.ts` (`McpStdio`)**: stdio transport that spawns through the Location's `Environment`
  (not the SDK's host-bound transport), so workspace-backed Locations run MCP servers in the
  sandbox. Configured env only; the spawner merges host env via `extendEnv` on the side that runs
  the process (host vars never cross into a remote workspace). Outgoing frames go through a bounded
  queue (stdin stays open all session); incoming stdout is newline-framed with a **16 MiB** max
  frame (oversize fails all pending requests and closes). stderr is drained to the debug log
  (chatty servers can't stall a full pipe) and its tail names the cause on unexpected exit.
  Scope-close kills the whole process group; graceful exit grace 2 s, SIGTERM→SIGKILL after 2 s.
- **`mcp/socket-client.ts` (`McpSocketClient`)**: transport over an **incoming** WebSocket the
  client app opened (app runs the MCP server, opencode runs the client — only direction inverted).
  One JSON-RPC message per text frame, no batching; invalid frames report `onerror` but keep the
  connection; pre-`start()` frames buffer FIFO; `onclose` fires exactly once; reconnect = fresh
  session (nothing replayed).
- **`mcp/oauth.ts` (`McpOAuth`)**: full OAuth client-provider + authorization flow. **CIMD**
  (Client ID Metadata Document, `https://opencode.ai/oauth/opencode/client.json`) is used as the
  `client_id` without registration when the server advertises support + public clients and no
  static `client_id` is configured; otherwise DCR or static. Concurrent **refresh-token** requests
  are deduplicated (rotating refresh tokens would otherwise `invalid_grant` the second). Resource
  URL validation binds the token to the configured URL (query is transport detail, not identity).
  `authorize` spins a **loopback `node:http` server** (lazy import so workerd never evaluates it),
  probes the server's 401 for resource-metadata/scope, discovers the auth server, opens the browser,
  and waits for the callback (state-checked; bare prefetches don't end the login) or a **pasted
  redirect URL** held to the same checks. The callback page waits for the token exchange so the
  browser never shows success for a rejected code. Tokens become a `Credential.OAuth` (expires 0 =
  non-expiring); `connectProvider` reads/refreshes only the *selected* credential row and only
  drops it on invalidate while it still holds the presented refresh token.
- **`mcp/instructions.ts` (`McpInstructions`)**: renders `<mcp_instructions>` per-server guidance as
  an `Instructions` source (`core/mcp-guidance`), keyed-delta updated. A server's instructions are
  shown only if the Session's merged permissions can reach ≥1 of its tools; with `execute` allowed
  and codemode on, guidance points at `execute` under `tools["<namespace>"]`, else tools are direct.
- **`tool/mcp.ts`** bridges MCP tools into the tool registry (see §6).

---

## 11. Config system

- **`config.ts` (`Config`)**: multi-layer JSONC config. `entries()` returns documents + discovery
  sources low→high priority. Loads managed policies first (they outrank), then integration/wellknown
  documents, global, explicit, direct, project, content, managed settings. Watches roots and
  reloads (debounced); `update` edits global JSONC preserving comments; `integration` sets an
  integration's document. Variable substitution (`{env:VAR}`, `{file:path}`).
- **`config/discovery.ts`**: sources = system dir, macOS MDM managed preferences, global config,
  explicit file, direct files, project `.opencode` dirs (upward walk), `.claude`/`.agents`
  compatibility roots. Symlink-aware, dedup against global roots.
- **`config/integration.ts`**: allow-listed remote keys (`providers`, `mcp`, `policies`,
  `websearch`); strips credentials; remote MCP only (no local command execution); integration +
  wellknown document types; `suppliers` map.
- **`config/managed.ts`, `markdown.ts`, `variable.ts`, `watch.ts`**: managed document type,
  gray-matter frontmatter parsing (with sanitize fallback), `{env:}/{file:}` substitution, watch
  planning. **`config/normalize.ts`**: canonicalization/diagnostics. **[PENDING]**
- Entry types: `Document`, `Directory`, `IntegrationDocument`, `WellKnownDocument`,
  `ManagedDocument`. `Config.latest(entries, key)` reads the highest-priority value.

---

## 12. Persistence / database

- **`database/database.ts` (`Database`)**: SQLite via Drizzle-Effect. WAL, `synchronous=NORMAL`,
  `busy_timeout`, `cache_size`, foreign keys; owner-only file perms (0600 + sidecars). Per-path
  bootstrap lock; `layerFromClient` for injected storage (workerd). Runs migrations.
- **`database/migration.ts`**: migration journal (`migration` table), seeds from legacy Drizzle
  journal, bootstraps fresh DBs from `schema.gen`, applies pending migrations transactionally
  (foreign-key relaxation where needed).
- **Drizzle-Effect integration** (vendored under `database/drizzle/`): `EffectSQLiteDatabase`,
  `EffectSQLiteSession`/`Transaction`, prepared queries with cache + JIT mappers, select/insert/
  update/delete/relational/count/raw builders, native-transaction detection for workerd.
- **SQLite drivers**: `sqlite.bun.ts`, `sqlite.node.ts`, `sqlite.workerd.ts` (Durable Object
  storage adapter — no tuning pragmas, native transactions, no nested transactions).
- **`database/batch.ts`**: ≤100 bound parameters per statement (Durable Object limit).
- **`database/path.ts`**: cross-platform absolute/directory/path columns (Windows↔POSIX storage).
- **`database/schema.sql.ts`**: `Timestamps` (`time_created`/`time_updated`).
- **Generated**: `schema.gen.ts`, `migration.gen.ts`, migration snapshots. **`v1-migration.*`**:
  V1→V2 data import. **[PENDING detail]**

---

## 13. Filesystem, files, snapshots, VCS, worktrees, projects, workspaces

- **`filesystem.ts` (`FileSystem`)**: location-confined `read`/`list`/`find`; `write` can reach
  outside (server tmp). Realpath + containment checks; directory boot validation.
- **`file-access.ts` / `file-mutation.ts` / `file-write.ts` / `file-retention.ts`**: path→permission
  target resolution; serialized mutation with BOM preservation; approve→write→format; time-based
  cleanup.
- **`snapshot.ts` (`Snapshot`)**: content-addressed filesystem snapshots using a **separate Git
  store** per project (alternates to the source repo), capture/diff/restore, periodic object packing.
- **`git.ts` (`Git`)**: repo discover/fingerprint/clone/create; tree capture/write/diff/restore via a
  **temporary index** (no `index.lock` contention); lossless object packing; worktree add/remove/list;
  remote/history helpers.
- **`vcs.ts` + `vcs/patch.ts` + `plugin/vcs/git.ts` + `plugin/vcs/hg.ts`**: VCS adapter abstraction;
  Git adapter with batched diffs + untracked intent-to-add batching; Mercurial adapter; patch
  parsing/splitting/budgets.
- **`worktree.ts` + `worktree/strategies.ts`**: named worktrees (create/remove/refresh) via pluggable
  strategies; discovery/adoption. **`worktree/{directory,git,sql}.ts`**: **[PENDING detail]**
- **`repository.ts` / `repository-cache.ts`**: remote repo reference parsing (GitHub shorthand, scp,
  URL, file) + local tracking checkouts (clone/fetch/reset, newest-wins).
- **`project.ts` (`Project`)**: project identity (git remote hash / root-commit / cached id / hg),
  `resolve`, `activate` (recency), `sweep` (archive gone projects), icon/commands.
- **`workspace.ts` (`Workspace`)**: logical workspaces backed by providers (remote/sandbox),
  provision/connect/destroy, idle suspension. **`workspace/driver.ts`**: **[PENDING]**
- **`location*.ts`**: see §4.1. **`location-activity.ts`**: **[PENDING]**

---

## 14. Shell subsystem

- **`shell.ts` (`Shell`)**: location-owned non-interactive process service. `create` spawns via the
  Environment, streams combined output to a file, tracks size/newlines, timeout/kill, retention,
  `get/list/wait/result/output/remove`. Publishes `Created/Exited/Deleted`.
- **`shell/parse.ts` (`ShellParse`)**: extracts permission resources + changed directories from a
  command (POSIX/bash/zsh/PowerShell), using a command-arity table and static-word analysis.
- **`shell/select.ts` (`ShellSelect`)**: chooses a shell (config/env/compat), cross-platform
  (Git Bash on Windows, `/etc/shells` on Unix), login/ps metadata, args.
- **`shell/result.ts`**: output/notice/notification formatting.
- **`shell/scan.ts`**: the portable shell tokenizer/scanner (~2,565 lines). **[PENDING — not yet read]**

---

## 15. Jobs, scheduling, goals

- **`job.ts` (`Job`)**: scoped process-local registry backed by a durable `job` table for
  backgrounded work. `start/wait/block/background/backgroundAll/cancel/cancelSession`,
  `pendingBackground/runningBackground/backgroundJobs/completeBackground`. Recovery metadata for
  shell/image/subagent.
- **`schedule.ts` (`Schedule`)**: scheduled prompts (in/at/every/cron) with timezone, `if`/`until`
  shell-or-code checks, leader election (one ticker per DB), missed-slot handling, retry/backoff,
  pause/resume/remove. **`schedule/check.ts`**: condition evaluation. **[PENDING detail]**
- **`plugin/goal.ts`**: autonomous objective loop — kickoff/continuation/judge prompts, verdict
  parsing (done/continue/blocked/paused/wait), stall detection, round/wait limits, boot identity so a
  restarted server pauses stale goals.

---

## 16. Supporting core services (read)

- **`form.ts` (`Form`)**: interactive forms (create/ask/reply/cancel), field validation, conditional
  fields, retention. Used by questions, websearch provider selection, MCP elicitation, OAuth.
- **`generate.ts` (`Generate`)**: stateless `text`/`image`/`decisions` generation via resolved models.
- **`integration.ts` (`Integration`)**: integration registry + connection resolution; OAuth/command/
  key/external/env methods; stateful OAuth & command attempts with expiry/scrubbing; token refresh.
- **`credential.ts` (`Credential`)**: stored credentials (key/oauth/external), activation, cross-
  process refresh locking.
- **`kv.ts` (`KV`)**: key/value store with prefix scan.
- **`shared-cache.ts` (`SharedCache`)**: cross-location cached loads (join running load, retry
  transient, keep last good, evict unread).
- **`usage-limits.ts`**: OpenCode Console workspace budgets + Go allowance.
- **`console-access.ts`**: Console server/headers from a credential.
- **`event-logger.ts`**, **`mime.ts`** (magic-byte detection): small supporting services.

### 16.1 Instructions framework (`instructions/*`, `instruction-discovery.ts`)

The prompt's instruction block is assembled from **composable sources**, each a typed definition
closed over canonical JSON by `Source.make`. Key machinery in `instructions/index.ts`:

- **Hashing**: `hash` = sha256 of the source's canonical JSON — identity is content, not name, so
  unchanged sources keep their prompt-cache position across turns.
- **Diffing**: `diff` compares old/new source sets; an *unavailable* source blocks initialization
  (`InitializationBlocked`) rather than silently rendering a partial system prompt. `Unavailable`
  and `Removed` are singletons distinguishing "temporarily unreadable" from "gone".
- **Rendering**: `renderInitial` produces the full block; `renderUpdate` emits either a keyed diff
  or a full replacement — whichever is *shorter* — via `listUpdate`/`diffByKey`, minimizing token
  churn in the cached prefix. `join` composes rendered fragments.
- **Builtins** (`instructions/builtins.ts`): `core/date` (current date) and `core/environment`,
  which renders an `<env>` block: working directory, workspace root, whether it is a git repo,
  platform, and a preference for `global.tmp` for scratch files.
- **File discovery** (`instruction-discovery.ts`): a State-managed map of path → content with
  project/global provenance flags; each file renders as `Instructions from: {path}`; updates use
  the same shorter-of-diff-or-replacement rule. This is how AGENTS.md/CLAUDE.md-style files enter
  the prompt, distinct from the session-level instruction epochs in §5.

### 16.2 Skills (`skill.ts`, `skill/discovery.ts`, `skill/instructions.ts`)

- **Catalog**: State holds skill metadata plus a files map; skills are addressed by `skill://`
  URIs. `prepare` scans a skill directory; `toModelOutput` renders `<skill_content>` plus a
  *sample* of at most 10 of the skill's files (bounded prompt cost).
- **Remote pull safety** (`skill/discovery.ts`): remote skills are fetched from an `index.json`.
  Every path component passes `isSafeSegment`/`isSafeRelativePath` — no `..` traversal, no URLs,
  no absolute paths — and downloads are same-origin-checked. Installs are **version-based atomic
  swaps**: stage the new version, then swap with a backup, so a failed pull never leaves a
  half-written skill. Cache lives under `global.cache/skills`.
- **Prompt guidance** (`skill/instructions.ts`): renders `<available_skills>` listing; skills with
  `autoinvoke: false` are excluded from the auto-listing; updates are keyed deltas (`listUpdate`).

### 16.3 References (`reference.ts`, `reference/instructions.ts`)

References are named pointers to local paths or git repos. Git sources are materialized through
`RepositoryCache.ensure` on a **daily** cadence with an **hourly** refresh check. The prompt block
`<available_references>` lists only references that carry a description (a reference without one
is not worth the model's attention). Same delta-rendering discipline as skills/instructions.

### 16.4 Formatters (`formatter.ts`, `formatter/builtins.ts`)

State-backed registry; `file(path)` matches by extension and runs the formatter command with
`$FILE` substitution. **26 builtins**: gofmt, mix, oxfmt, prettier, biome, zig, clang-format,
ktlint, ruff, air, uv, rubocop, standardrb, htmlbeautifier, dart, ocamlformat, terraform,
latexindent, gleam, shfmt, nixfmt, rustfmt, pint, ormolu, cljfmt, dfmt. Each builtin carries
**enable-detection**: it activates only when the project shows evidence (package.json dependency,
config file like `.prettierrc`, or the executable on PATH), so formatters never run uninvited.

### 16.5 Ripgrep (`ripgrep.ts`, `ripgrep/binary.ts`)

- **Adapter**: raw find/glob/grep over the `rg` binary with JSON output parsing. Guards:
  `MAX_SUBMATCHES = 100`, `MAX_LINE_CHARS = 2000` (truncation, not failure). Regex syntax errors
  are detected from stderr and surface as typed `InvalidPatternError`; exit codes 0 (matches),
  1 (no matches), 2 (error) are handled distinctly.
- **Supply chain** (`binary.ts`): ripgrep is **pinned to 15.1.0** with a per-platform **SHA-256
  table**. Resolution order: system `rg` → cached download → fetch from GitHub releases, verify
  the hash, extract. On Windows the zip is extracted with **System32 bsdtar** specifically to
  avoid ANSI-codepage path corruption. This is the repo's pattern for vendored binaries: pin,
  hash, verify, cache.

### 16.6 Image pipeline (`image.ts`, `image/photon.ts`, `image/photon-normalize.ts`)

- **Service** (`image.ts`): State-configurable limits — `autoResize: true`, max **2000×2000**,
  max **5 MiB base64**. Typed errors: `ResizerUnavailableError`, `DecodeError`, `SizeError`
  (the latter carries actual vs. allowed dimensions/bytes for a useful model-facing message).
- **Worker isolation** (`photon.ts`): photon's wasm heap can reach hundreds of MB after a large
  image, so normalization runs in a `worker_threads` worker that is **terminated after 10 s
  idle**, returning memory to the OS. One request at a time (semaphore) so a panic can't take
  down a queue and a stale reply can't answer the next request. A failed/interrupted request
  discards its worker (heap may be poisoned). If workers are unavailable (e.g. bundled runtime
  without `worker_threads`), it logs once and falls back to in-process normalization.
- **Normalization** (`photon-normalize.ts`): PNG passthrough when ≤384 KB base64 or ≤256×256 px;
  transparency detected by sampling a ≤64×64 grid (>5% transparent pixels ⇒ keep PNG); otherwise
  JPEG at qualities **[80, 70, 55, 40]**; oversized images walk a **0.75× downscale ladder**
  (Lanczos3) trying encoders until one fits the byte budget. An image that already fits is only
  re-encoded if JPEG makes it strictly smaller. `available = photonWasm !== ""` — workerd has no
  wasm artifact and fails typed *before* touching URLs/workers (an untyped throw there once
  turned any image-bearing prompt into a 500).
- **Runtime wasm shims** (`image/photon-wasm.{bun,node,workerd}.ts`, selected via the `#photon-wasm`
  package import condition): **bun** embeds the `.wasm` as a static file import at compile time;
  **node** resolves the package path (or `OPENCODE_PHOTON_WASM_PATH`); **workerd** exports `""`
  (no filesystem artifact) so the service degrades to a typed `ResizerUnavailableError` instead
  of breaking module load.
- **Worker entry** (`image/photon-worker.ts`): loads photon, posts `Ready`, then answers each
  `Request` with a `Done` result. A load failure throws before `Ready` (server falls back to
  in-process); a resize throw (wasm panic) is left uncaught so it **kills the worker** rather
  than serving later requests from a poisoned heap.
- **Completion notice** (`image/notice.ts`): background image jobs report back as
  `<image id="…" state="…">…</image>`, mirroring the `<shell id=…>` notice convention.

### 16.7 Voice (`voice.ts`)

Realtime voice sessions over `Realtime.engines` (openai-live, xai, google). Credential sourcing:
the engine's own provider connection first (stored key or env); for **GPT-Live without an OpenAI
key**, OpenCode's **hosted GPT-Live** on the OpenCode Console connection
(`https://opencode.ai/inference/openai/v1`, billed to the workspace, `x-opencode-org-id` header
from credential metadata). Console **key or OAuth sign-in** both work for hosted live; ChatGPT
sign-in cannot start voice sessions anywhere. Errors are typed `InvalidRequestError` /
`UnavailableError` with provider-specific missing-key messages. `models()` reports per-engine
availability and picks the first available as default.

### 16.8 Web search (`websearch.ts`)

State-backed provider registry (plugins register `ProviderImplementation`s). Selection is
`ID | "random" | false`, persisted in KV under `websearch:provider`; invalid stored values are
scrubbed. Query path:

- Explicit `providerID` → that provider or typed `ProviderNotFoundError`.
- Fixed selection → that provider; `false` → `DisabledError`; none → `ProviderRequiredError`
  (the UI then runs consent/selection via Form).
- **"random"**: per-session **affinity** (sticky provider, cleared on session Deleted/Moved;
  the affinity cell is captured up front so deletion can't reinsert an in-flight entry).
  On **HTTP 429** the provider enters a cooldown parsed from `retry-after` (seconds or HTTP-date;
  default 60 s) and the loop fails over to another non-cooled, non-attempted provider; when all
  are exhausted it returns the last cooldown error. Non-429 failures return immediately.
- `default()` inspection deliberately does **not** pick a provider or reopen consent while every
  provider is cooling down.

### 16.9 Well-known discovery (`wellknown.ts`, `wellknown/plugin.ts`)

Lets an organization publish integration/auth/config at `https://<origin>/.well-known/opencode`.
The **Manifest** carries optional `auth` (a command + env var name), inline `config`, and a
`remote_config` (URL + headers). `inspect` GETs the manifest (15 s timeout, JSON-schema-validated);
`resolveEntry` appends the remote config, substituting `{env:NAME}` placeholders in the URL and
headers from supplied variables or `process.env`. Sources, manifests, and resolved configs are
persisted in KV (`wellknown:sources`, `wellknown:manifest:<origin>`, `wellknown:config:<origin>`).
An **unreachable source keeps its last manifest** so its remote config still loads after restart.
`refresh` is semaphore-locked and publishes a global `wellknown.updated` only on a deep change.
The companion **plugin** registers each manifest's `auth.command` as a `login` *command* method on
the matching Integration (named by the origin's hostname) and reloads integrations on update.
This is the enterprise "point at a domain, get SSO + config" onboarding path.

### 16.10 Artifacts (`artifact.ts`)

Experimental (`experimental.artifacts` flag) publishable mini-sites/files produced by a session.
A State registry of **providers** (default `local`, capability `static`); each provider implements
create/read/update/delete over a `files: Record<path, Uint8Array>` map and returns an optional URL.
The **local provider** writes files under `global.data/artifacts/<id>` and serves them at
`/api/experimental/artifacts/<id>/view/`. Records (info + directory + projectID) live in KV under
`artifact:item:<id>`; listing scans the prefix filtered to the current project. Safety: every file
path is `normalizePath`-checked (relative only, no `..`/`.`/empty/NUL/absolute segments); entry
resolution prefers `index.html` → `index.md` → the sole file, else requires an explicit `entry`.
Directory replacement is an **atomic staging/backup swap** (write to `.staging-<nonce>`, rename old
to `.backup-<nonce>`, rename staging in, restore backup on failure). `readLocalFile` serves a single
file with MIME by extension (utf-8 charset for text/js/json) falling back to magic-byte detection.
Typed errors: Disabled/NotFound/FileMissing/ProviderNotFound/Invalid/Provider. `prompts()` feeds the
default provider's prompt + other providers' capabilities into the system prompt.

### 16.11 RPC (`rpc.ts`)

A typed, schema-validated request/response + event layer plugins use to expose methods to the
server/clients. `register(definition, handlers)` is acquire/release-scoped (multiple registrations
per id; `call` uses the last). `call` validates input, runs the handler, normalizes **declared**
errors (`ctx.error(type, message, data)` → encoded against `method.errors[type]`; undeclared types
die) and handler **defects** (logged, returned as `rpc.internal`), validates output, and races a
`closed` Deferred so a long-lived call releases its Location when the routing cache invalidates it.
Schemas may be Effect `Schema`, **Standard Schema v1**, or raw **JSON Schema** (compiled to a codec
via `SchemaRepresentation.fromJsonSchemaDocument`, cached in a WeakMap). Events are published on the
Bus as ephemeral `rpc.<id>.<name>` definitions scoped to the Location; `client(definition)` returns
typed method wrappers + `events.subscribe`. System failures: `rpc.unavailable`, `rpc.method_not_found`,
`rpc.invalid_input`, `rpc.invalid_output`, `rpc.internal`.

### 16.12 OAuth callback pages (`oauth/page.ts`)

Self-contained, offline, branded HTML served by the loopback HTTP servers that finish OAuth
exchanges (MCP, Codex/ChatGPT, xAI, Snowflake, DigitalOcean, …). `success`/`error`/`bootstrap`
render a card with the OpenCode wordmark and a curated subset of the **OC-2** design tokens
(light default, dark via `prefers-color-scheme` or `[data-theme]`). `bootstrap` handles **implicit
grant**: its script reads the URL fragment (`access_token`/`error`/`state`), POSTs it to a
same-origin `tokenPath`, then flips the card to success/error in place and auto-closes. All dynamic
text is HTML-escaped and script strings are `<`-escaped (`</` → `\u003c`) to prevent injection.
The file is explicitly kept in sync with `packages/ui` theme tokens and the logo geometry.

### 16.13 Execution plane (`environment/*`)

The **Environment** service is the seam that decides *where* a Location's processes run and its
files live. `Interface = { files: Files, spawner: ChildProcessSpawner }`. At build time it binds to
the Location's **workspace** (`workspace.connect(workspaceID)`) if one is attached, else the
**local host driver**; an unknown/destroyed placement is a configuration *defect* (Environment has
no error channel). Nothing above this seam touches `node:fs` or spawns directly.

- **`Files` contract** (`files.ts`): `read/write/stat/list/remove/move/mkdir` with typed
  `NotFound`/`WrongKind`/`Failed`. Crucial symlink semantics: **content** ops (`read`, `list`)
  follow the *final* symlink; **metadata** ops (`stat`, entry tags) do not (lstat-like). `info`
  describes the target whose bytes are returned. `typeFollowing`/`exists` derive follow-stat from
  the lstat contract (a dangling symlink does not exist). Whole-file reads cap at **64 MiB**;
  larger files must use ranges.
- **Local driver** (`local.ts`): deliberately raw `node:fs` (not effect's FileSystem, whose stat
  always follows symlinks) to get lstat semantics. `move` into an existing directory appends the
  basename; ENOENT/ENOTDIR map to `NotFound`.
- **Exec defaults** (`exec-defaults.ts`): the *portable* Files implementation derived by spawning
  one `sh -c` process per intent with `"$1"` = target path. Classification uses an **exit-code
  protocol** (44=NotFound, 45=WrongKind, 46=Failed) so failures never parse localized error text;
  `LC_ALL=C` pins the one remaining stderr match. Uses GNU `stat`/`find`/`dd`/`mv` (BSD/busybox
  userlands won't work). `makeFiles(driver)` = exec defaults overlaid with `driver.overrides` (the
  local driver overrides everything with native fs; a remote workspace keeps the exec defaults so
  file ops run *inside* the sandbox).
- **Memory driver** (`memory.ts`): an in-memory POSIX-ish filesystem (Map of file/directory/symlink
  nodes, full symlink resolution with loop detection, move-into-self guards) for tests/sandboxes;
  its spawner always fails ("cannot spawn processes"). Exposes an extra `symlink` op.
- **Unavailable** (`unavailable.ts`): a spawner that always fails with "no execution plane" for
  Locations with neither a workspace nor host spawn capability.

This is what lets MCP stdio servers (§10), shell (§14), and file tools (§13) all run identically
whether the Location is local, in a remote workspace, or in memory.

Still **[PENDING]** in this area: `pty/*`, `persistent-pty/*`, `account/*`, `codemode/*`, `v1/*`,
`util/*`, `effect/*`, `environment/*`, `event/*`, `modal/*`, `models-dev/*`, `github-copilot/*`
(see ledger).

---

## 17. Fork-specific surface (egress, desktop, GUI) — [PENDING source read]

From the root docs only (implementation not yet read; lives in `packages/desktop` /
`packages/gui-plugins`):

- **Multi-lane egress manager** with health checks and rotation, surfaced in the UI. Lanes: Direct,
  WARP (`warp-cli` registration rotation), Tor (Expert Bundle, `SIGNAL NEWNYM`), free proxy
  (scraped public lists). Rotation verified against the provider endpoint before being recorded.
- **Provider probe** and **status panel** are extensions of OpenCode's architecture.
- **Ragestar identity/theme** (owl mark, own colour tokens; `owl` default theme).
- **Desktop shell** (Electron) drives the CLI engine sidecar; isolated engine profile; update feed
  to the fork's own releases; engine-update adoption contract (integrity/boot/routes/round-trip).
- **gui-plugins** subdirs seen in the tree: `browser, context, debug, details, file, review, ssh,
  terminal, updater, wsl` (each with i18n). These implement the desktop inspector/panes.

> This section will be replaced with a source-level account once `desktop`/`gui-plugins` are read.

---

## 18. Cross-cutting patterns & invariants

- **Event sourcing + projections**: durable minimal facts; read models rebuilt by folding; atomic
  `commit` hooks keep local projections consistent with the event transaction.
- **Write-ahead claims for crash recovery**: execution claims and resume budgets make restart
  recovery a property of the database, not of shutdown hooks.
- **Doorbell coalescing**: one execution fiber per session per busy period; late wakes start a
  successor; interrupts acknowledge before cleanup settles.
- **Decline-as-defect tunnel**: user permission declines bypass tool error blankets and end the
  step; feedback-bearing declines stay typed so the model can continue.
- **Prompt-cache awareness**: instruction ordering, image-budget hysteresis, compaction precompute,
  affinity headers, and schema stabilization all preserve cached prefixes.
- **State transforms + grouped failure**: plugin/config edits are replayable; a failing plugin group
  is detached without corrupting the rest.
- **Location-scoped services, global coordination**: catalogs/runner/tools are per-location;
  execution/jobs/schedule/credentials are process-global.
- **Provider-agnostic by construction**: no endpoint in source; providers are data + plugins; the
  engine profile is isolated.

---

## 19. Coverage ledger

### Deep-read so far (~323 files), by area
- **Root docs/config:** README, NOTICE, CREDITS, PRESETS, SECURITY, CONTRIBUTING, AGENTS, LICENSE,
  package.json, turbo.json, bunfig.toml, sst.config.ts, sst-env.d.ts, tsconfig.json, presets.json,
  community-presets.json, strobe.json, flake.nix, install, .oxlintrc.json, dotfiles.
- **core/session:** essentially all (facade, handles, projector, message-updater, store, history,
  blob, inbox, execution, run-coordinator, restart, runner/*, compaction, context, model-request,
  model-transport, instruction-state/entry, instructions, title, diff, move, revert, transfer,
  stats, generate, command, environment, affinity, shell, skill, system-prompt, usage,
  to-session-error, subagent-job/completion, background, recent-text, stored, info, sql, schema,
  event, message, error, prompt/system.txt).
- **core/tool:** tool.ts, runtime, all `tool/plugin/*`, mcp, read-filesystem, html-markdown,
  http-body, search, file-diff; tool-output.
- **core/permission:** permission.ts, saved; file-access; managed-policy.
- **core/provider/model:** provider, model, model-resolver, model-retry, aisdk, aisdk-native; all
  `plugin/provider/*` incl. the full `claude-agent/*` subtree; models-dev plugin.
- **core/plugin:** plugin, host, hooks, internal, module, supervisor, service, instance, update,
  promise, source-directory, agent, command, goal, identity, mcp-codemode-defaults, models-dev,
  skill, tool-input-repair, optimize, plan, verbosity, warming, vcs/git, vcs/hg, websearch/*.
- **core/config:** config, discovery, integration, managed, markdown, variable, watch; all
  `config/plugin/*`.
- **core/mcp:** all — index, client, connection, pool, oauth, stdio, socket-client, instructions.
- **core/database:** database, migration, batch, path, schema.sql, sqlite.{bun,node,workerd},
  v1-migration.{ts,noop}, drizzle + effect-sqlite + sqlite-core/effect/* + internal/drizzle-utils.
- **core/files/vcs:** filesystem, file-access/mutation/write/retention, snapshot, git, vcs,
  vcs/patch, worktree, repository, repository-cache, project, workspace, location*.
- **core/shell:** shell, parse, select, result (scan pending).
- **core/misc:** form, generate, integration, credential, kv, shared-cache, usage-limits,
  console-access, event-logger, mime, job, schedule.
- **core/prompt & media:** instructions/{index,builtins}, instruction-discovery, skill/{index,
  discovery,instructions}, reference/{index,instructions}, formatter/{index,builtins},
  ripgrep/{index,binary}, image/* (all: index, photon, photon-normalize, photon-worker, notice,
  photon-wasm.{bun,node,workerd}), voice, websearch.
- **core/integration & rpc:** wellknown/{index,plugin}, artifact, rpc, oauth/page.

### Not yet read (must be covered to satisfy "don't forget anything")
- **Remaining core (~195 files):** `shell/scan.ts`, `config/normalize.ts`, `variant.ts`,
  `models-dev.ts`, `models-dev/v1.ts`, `modal/models.ts`, `github-copilot/*`,
  `persistent-pty/*`, `pty/*`, `environment/*`,
  `filesystem/*` (fff, file-watch, location-watcher, protected, search, watcher),
  `account/*`, `codemode/*`, `v1/*`, `util/*`, `effect/*`, `event/*`,
  `workspace/driver.ts`, `worktree/*`, `project/{icon,schema,sql}.ts`, `permission/sql.ts`,
  `schedule/{check,sql}.ts`, `job/{list,recovery,sql}.ts`, various `*/sql.ts`,
  `database/v1-migration.bun.ts`, generated files, and all core tests.
- **All other packages:** `ai`, `schema`, `protocol`, `server`, `client`, `sdk`, `cli`, `util`,
  `plugin`, `codemode`, `app`, `tui`, `desktop`, `gui-plugins`, `ui`, `session-ui`, `theme`,
  `stories`, `web`, `stats`, `simulation`, `http-recorder`, `httpapi-codegen`, `patchmark`, `merman`,
  `latex`, `plugin-browser`, `identity`, `function`, `process-daemon`, `effect-drizzle-sqlite`,
  `script`, `plugins`.
- **Non-package:** `sdks/vscode`, `services/*`, `infra`, `script`, `scripts`, `nix`, `salesforce`,
  `specs`, Rust sources, i18n data, remaining JSON/config/text, docs, and all tests.

> **Next step:** continue the file-by-file read (core remainder → `ai`/`schema`/`protocol`/`server`
> → clients/sdk/cli → desktop/gui-plugins egress → UI packages → services/infra/scripts → i18n/
> tests/docs), appending to this document and updating the ledger until coverage is complete.