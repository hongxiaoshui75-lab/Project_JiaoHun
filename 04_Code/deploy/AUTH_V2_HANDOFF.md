# Auth v2 final deployment handoff

The local implementation does not require sudo to develop or test. The final service stop/start is a maintainer action: do not re-enable or use the temporary sudoer account without renewed approval.

Prepare one dedicated staging child under `/vol2/1000/Dockers/projects/Project_JiaoHun/`, containing:

- `site/`: complete new frontend and validated levels build, not an overlay of partial assets.
- `runtime/`: network-server.mjs, network/store.mjs, frozen core/engine.mjs and core/save.mjs, tools/operator-user.mjs and tools/prepare-auth-v2.mjs.

Before cutover, run the backend integration tests, frontend checks and migration rehearsal against disposable copies. The active database is now `progress-v2.sqlite`; the old `progress.sqlite` is retained and snapshotted as `legacy-progress-archive.sqlite`, with no automatic account claim or passwordless fallback. A rerun never overwrites that archive. The two old test accounts are not silently bound to new accounts.

Only after the staged release is reviewable, the maintainer runs `upgrade-auth-v2.py --stage=<absolute staging child>` through an authorized administrator terminal. The script stops only game-save, snapshots existing SQLite databases using SQLite backup, preserves old site/runtime directories, prepares v2 as agent, sets Caddy read ACL on frontend files, starts game-save and checks health. On failure it restores old code/site and restarts the original service, retaining new/old database files for inspection. It does not edit Caddy, nginx, frp, fnOS, remote-access packages or system accounts.

Initialize application role accounts as agent in the NAS local interactive terminal (no default passwords, no command-line secrets):

```text
/opt/node/bin/node /vol2/1000/Dockers/projects/Project_JiaoHun/runtime/tools/operator-user.mjs --data=/home/agent/jiaohun-game-data --role=presenter --name=presenter
/opt/node/bin/node /vol2/1000/Dockers/projects/Project_JiaoHun/runtime/tools/operator-user.mjs --data=/home/agent/jiaohun-game-data --role=inspector --name=inspector
```

The CLI requests a hidden password and confirmation; it rejects non-TTY input, password flags and environment-variable password configuration. Re-running it rotates only the named application's role password and revokes that role account's sessions. It is not a player-password reset interface and never grants OS permissions.

Acceptance: v1 join/lookup/resume/profile return 410; v2 health returns ok; register/login returns only player metadata and sets a Secure HttpOnly cookie; recovery code works once; wrong passwords and cross-role access fail; participants require explicit room consent; observing returns getView projection only; leaving or closing a room prevents observation; diagnostics do not create real players or alter saves. Confirm both presenter and inspector login through the browser; there are no production role passwords until the maintainer initializes them.

Authenticated save reads and writes also bind the page identity: player saves, room join/leave/heartbeat and secret/logout require `X-Player-Id`; presenter demo reads/writes and operator mutations require `X-Operator-Name` containing the URL-encoded current page operator name. Missing or mismatching identity returns 401 before reading/writing another cookie subject's data. Bootstrap `/auth/me` and `/operator/me` permit no identity header, but validate it when present. SSE cannot set custom headers, so private room ownership and the initial revocable role session bind its stream; logout closes it immediately, every event checks revocation, and expiry is checked during keepalive.

Room snapshots distinguish `online`, `away` and `left`. A left member retains only the frozen stage summary visible at exit, not future private progress; observation is denied. Closing the room returns empty members/events and terminates its streams.

Backups and a credential-free receipt are stored under `/home/agent/jiaohun-audit/auth-v2-cutover-<timestamp>/`. After a live v2 release has accepted real accounts, do not blindly roll back to v1: preserve v2 first and decide explicitly how to restore compatibility. Never copy an active SQLite file alone while ignoring its WAL; use the backup API or stop the service.

## Entry redesign batch (2026-11-20)

Frontend-only changes plus one string-only runtime change. Full plan and smoke list: `00_Docs/NAS_DEPLOY_PLAN_20261120.md`.

- `site/` must be a **full rebuild, not an overlay**: `lobby.html`, `static-site.mjs` and all four shared-chrome pages changed, and the build now also ships `theme.js`, `entry-tour.mjs` and `chrome/*.webp`.
- `runtime/network-server.mjs` changed in five player-facing error strings only. No route, parameter, cookie or schema change; the database is untouched. It still has to be staged, because it lives in `runtime/`.
- Caddy/CSP unchanged: the new scripts are same-origin files, so `script-src 'self'` still holds. Do not add `unsafe-inline` for this batch.
- Restart `game-save` as part of the cutover (the existing staging script already stops and starts it), then confirm `GET /game/theme.js`, `/game/entry-tour.mjs`, `/game/chrome/paper.webp` return 200 and that the browser console shows no CSP violation.
- Rollback: restore the previous `site` and `runtime` directories; the database needs no action. A missing `theme.js` after rollback is expected and only means the old site has no theme toggle.