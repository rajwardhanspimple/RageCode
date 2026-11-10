## Ragestar 2.2.9

**Every link now lands somewhere real.** The brand destinations, the About screen in every
language, the updater, the menu's bug and feature links, TUI crash reports and the project
pages all point at `github.com/rajwardhanspimple/RageCode`. GitHub Discussions is enabled, the
issue templates match the paths the menu opens, and the project site is published from `docs/`.

A provider-agnostic, open-source desktop AI client. Nothing is preconfigured: no provider, no
endpoint in the code, no credential. You connect an account, or you don't.

### Downloads
| Platform | Files |
| --- | --- |
| Windows 10/11 x64 | `Ragestar-Setup-2.2.9.exe` |
| macOS 14+ Apple Silicon | `Ragestar-2.2.9-arm64.dmg`, `Ragestar-2.2.9-arm64.zip` |
| macOS 14+ Intel | `Ragestar-2.2.9-x64.dmg` |
| Linux x64 (glibc) | `.AppImage`, `.deb`, `.rpm` |

Every asset is built from this tag on a clean GitHub runner. Windows also publishes `latest.yml`
and a blockmap for the built-in updater; Linux publishes `latest-linux.yml`.

### What's new
- **Links resolve.** `github.com/ragestar/*` was never a real repository. Every destination now
  points at the RageCode repository, including the About line in all 62 locales.
- **Issue flow works.** Share Feedback and Report Bug open the templates that exist
  (`feature-request.yml`, `bug-report.yml`); Discussions is the support forum.
- **Shell polish.** The shell chrome is localized, type tokens follow the user's font setting,
  the new-session panel is notched at the 14px panel radius, the wordmark reads RAGESTAR again,
  and the inspector has its own rail toggle.
- **A clean corner.** The floating "Check for updates" pill only appears when there is an update
  to install or report.
- **Licence restored.** `LICENSE` and `NOTICE.md` ship with the source and the installer licence
  page points at the new notices file.

### Verify before you run
- `SHA256SUMS.txt` carries the SHA-256 for every attached artifact, written from the files GitHub
  stores. Compare it with the file you downloaded; the value is release-specific.
- The 2.2.7 installer was scanned at VirusTotal with **0/50 detections** and the application
  binary with **0/68**; those reports are on the
  [checksums page](https://rajwardhanspimple.github.io/RageCode/checksums.html). The 2.2.9 installer
  is pending its first scan.
- No build is code-signed. SmartScreen on Windows and Gatekeeper on macOS ask you to confirm the
  publisher; check the hash against this release before you do.

### Installing this one
- 2.2.8 installs can take this release through the built-in updater.
- This build bundles engine 2.2.6, the version pinned in the release workflow. From 2.2.9 the app
  may adopt a newer engine on its own, but only after the candidate verifies its published
  integrity, boots in a throwaway data directory, serves every route the window calls, and
  survives a session round trip; a failed launch reverts to the bundled engine.

### Platform notes
- **Windows:** the installer is per-user and does not require an administrator.
- **macOS:** open the dmg and drag Ragestar to Applications. The build is unsigned and not
  notarized, so the first launch needs right-click -> Open.
- **Linux:** the AppImage runs after `chmod +x`; the deb and rpm install the same app.

### Notes
- Ragestar is not affiliated with OpenCode. See `NOTICE.md` and `PRESETS.md`.
- The engine is downloaded from npm at build time; this release bundles 2.2.6.
