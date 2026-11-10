## Ragestar 2.2.8

**Engine updates now have a bouncer.** The app can adopt a newer CLI engine without shipping a
new desktop build, but only after the candidate proves it still serves every route the window
calls. An engine that fails the gate is refused; one that passes but never reaches its sidecar is
rolled back on the next launch.

A provider-agnostic, open-source desktop AI client. Nothing is preconfigured: no provider, no
endpoint in the code, no credential. You connect an account, or you don't.

### Downloads
| Platform | File |
| --- | --- |
| Windows 10/11 x64 | `Ragestar-Setup-2.2.8.exe` |

macOS and Linux packages are not part of this release. Build them from source with the commands
in the README; the release workflow produces them on native runners when dispatched.

### What's new
- **Compatibility-gated engine updates.** Once per launch a production build consults npm's
  `latest` dist-tag and may stage a newer engine. The candidate must match the registry's
  `dist.integrity` sha512, boot in a throwaway data directory, report the exact version being
  adopted, serve all 25 operations the window calls, and complete a real create/delete session
  round trip. Additions are allowed; a renamed or dropped route is a refusal.
- **Two-phase commit with rollback.** A staged engine is marked `attempting` when it starts. The
  adoption becomes permanent only when its sidecar connects; a launch that never gets there
  reverts to the bundled engine on the next start and records the rejection, so a broken engine
  is never retried.
- **The pinned engine is gated at build time.** `bun run build` now boots the engine it is about
  to package and refuses the build if that engine has lost a required route.
- **Forward moves only.** Same major, no prereleases, and a `0.x` engine is limited to patch
  moves. `RAGESTAR_ENGINE_UPDATE=off` disables the check.

### Verify before you run
- `SHA256SUMS.txt` carries the SHA-256 for the Windows installer, `latest.yml` and the blockmap.
  Compare it with the file you downloaded; the value is release-specific, so always take it from
  this release rather than from a copy of these notes.
- The 2.2.7 installer was scanned at VirusTotal with **0/50 detections** and the application
  binary with **0/68**; those reports are on the
  [checksums page](https://rajwardhanspimple.github.io/RageCode/checksums.html). The 2.2.8 installer
  is pending its first scan.
- The Windows installer is unsigned. SmartScreen asks you to confirm the publisher; check the
  hash against this release before you do.

### Installing this one
- 2.2.7 installs can take this release through the built-in updater. The engine stays at 2.2.6
  until a newer one passes the gate.

### Platform notes
- **Windows:** the installer is per-user and does not require an administrator.
- **macOS and Linux:** build from source. The packaging scripts target those platforms, but this
  release attaches no packages for them.

### Notes
- Ragestar is not affiliated with OpenCode. See `NOTICE.md` and `PRESETS.md`.
- The engine is downloaded from npm at build time; the version shipped is listed in the release
  assets.
