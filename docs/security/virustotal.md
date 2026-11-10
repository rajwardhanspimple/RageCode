# VirusTotal

A VirusTotal report is evidence, not a badge you paste on and hope nobody checks. This page
exists so the evidence is easy to verify and easy to replace when a release is published.

**Current status:** both the 2.2.7 installer and the application executable it writes have been
scanned, and neither was flagged — **installer 0/50**, **application binary 0/68**.

**2.2.9:** the published installer has not been scanned yet. Its SHA-256 is
`0f69bf599cdb1b7c39d5092fac8df597d816d98e043cd36cdfc7c0b85d6455a9` (257,682,369 bytes); the
release attaches `SHA256SUMS.txt` so you can verify the download before running it, and you can
upload the file to VirusTotal yourself.

```
file    Ragestar-Setup-2.2.7.exe  (installer)
sha256  4fe3199ec3090b91454d2d3822b0b907bcb90f4ba106b4b983c6aa3631db0d6a
size    257,940,413 bytes
result  0/50 engines, scanned 9 November 2026
report  https://www.virustotal.com/gui/file/4fe3199ec3090b91454d2d3822b0b907bcb90f4ba106b4b983c6aa3631db0d6a
```

```
file    Ragestar.exe  (application binary inside the installer)
sha256  3dda8e6a3d82634e5f7c749238ca5701cd3cb7b60f9ee85e122295c55d93bb1d
size    246,924,288 bytes
result  0/68 engines, scanned 9 November 2026
report  https://www.virustotal.com/gui/file/3dda8e6a3d82634e5f7c749238ca5701cd3cb7b60f9ee85e122295c55d93bb1d
```

[VirusTotal report](https://www.virustotal.com/gui/file/4fe3199ec3090b91454d2d3822b0b907bcb90f4ba106b4b983c6aa3631db0d6a)

The two hashes are different files on purpose: the installer is an NSIS container, and the
executable is one file inside it. `SHA256SUMS.txt` lists the installer and the other release
artifacts; the second hash identifies the application binary that actually runs.

## Verify a download yourself

Do not trust a screenshot. Hash the file you actually downloaded and compare it with the hash
published in the release notes:

```powershell
Get-FileHash .\Ragestar-Setup-2.2.9.exe -Algorithm SHA256
```

```bash
sha256sum Ragestar-Setup-2.2.9.exe
```

`SHA256SUMS.txt` is written over every attached artifact by the release workflow, so it covers
Windows, macOS and Linux packages as well as the update feeds. If the hashes differ, the file is
not the file that was published.

## SmartScreen and the unsigned installer

No build is code-signed. SmartScreen therefore shows "Windows protected your PC" until
the download builds reputation. To run it: **More info -> Run anyway**. Before you do, check the
hash:

```powershell
(Get-FileHash .\Ragestar-Setup-2.2.9.exe -Algorithm SHA256).Hash.ToLowerInvariant()
```

The value must match the line for `Ragestar-Setup-2.2.9.exe` in `SHA256SUMS.txt` on the
release. A signed build replaces this section with the certificate subject.

## Filling in the report (maintainer, once per release)

1. Build the release.
2. Upload the installer to <https://www.virustotal.com/gui/home/upload>.
3. Open the finished report and copy its URL, which looks like
   `https://www.virustotal.com/gui/file/<sha256>`.
4. Add the same link, the SHA-256, and the "scanned on <date>" line to
   `docs/security/virustotal.md` and the GitHub release body.

The report URL contains the SHA-256, so it can be checked against the release hash by anyone.
A report alone can be edited; a hash cannot be made to match a different file.

## What the report will and will not show

- An unsigned Electron installer routinely picks up heuristic and "generic" detections from a
  handful of engines. That is expected for an unsigned build, and the report shows exactly
  which engines fired and on what.
- A report is not a warranty. It records what a set of engines said about one file at one
  moment. The SHA-256 and the source in this repository are the durable evidence.
- The engine binary is downloaded from the npm registry at build time and is covered by the
  same installer hash. Its version is pinned by `RAGESTAR_CLI_VERSION` and recorded in
  `packages/desktop/resources/opencode-cli.version`.
