#!/bin/sh
# Run as jiaohun-dev. No general sudo, database access, Caddy or fnOS changes.
set -eu
root=/vol2/1000/Dockers/projects/Project_JiaoHun
package=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
node=/opt/node/bin/node
test "$(id -un)" = jiaohun-dev
test -d "$root/site"
test -d "$root/runtime"
"$node" "$package/verify-release.mjs"
stamp=$(date +%Y%m%d-%H%M%S)
backup="$root/release-backups/$stamp"
stage="$root/release-stage-$stamp"
mkdir -p "$backup" "$stage/runtime" "$stage/site"
tar -czf "$backup/site-runtime.tar.gz" -C "$root" site runtime
test -s "$backup/site-runtime.tar.gz"
cp -R "$root/runtime/." "$stage/runtime/"
cp -R "$package/runtime/." "$stage/runtime/"
cp -R "$package/site/." "$stage/site/"
chgrp -R jiaohun-runtime "$stage/runtime"
chmod -R u=rwX,g=rX,o= "$stage/runtime"
chgrp -R jiaohun-site "$stage/site"
chmod -R u=rwX,g=rX,o= "$stage/site"
# Preflight with the OLD content first. The new runtime takes a consistent
# private SQLite backup before schema changes; the service keeps DB ownership.
mv "$root/runtime" "$backup/runtime"
mv "$stage/runtime" "$root/runtime"
if ! sudo -n /usr/local/sbin/jiaohun-service restart; then
  mv "$root/runtime" "$stage/runtime.failed"
  mv "$backup/runtime" "$root/runtime"
  sudo -n /usr/local/sbin/jiaohun-service restart
  echo 'Runtime preflight failed; old runtime restored. Site untouched.' >&2
  exit 1
fi
if ! curl --fail --silent --retry 8 --retry-connrefused --retry-delay 1 --max-time 5 http://127.0.0.1:4186/api/v2/health | "$node" --input-type=module -e 'let s="";for await(const c of process.stdin)s+=c;const h=JSON.parse(s);if(!h.ok||h.release!=="content-v2"||!h.upgradeBackupReady)process.exit(1)'; then
  mv "$root/runtime" "$stage/runtime.failed"
  mv "$backup/runtime" "$root/runtime"
  sudo -n /usr/local/sbin/jiaohun-service restart
  echo 'Database backup not confirmed; old runtime restored. Site untouched.' >&2
  exit 1
fi
printf '%s\n' 'Consistent private database backup confirmed before content switch.' > "$backup/backup-receipt.txt"
mv "$root/site" "$backup/site"
mv "$stage/site" "$root/site"
sudo -n /usr/local/sbin/jiaohun-service restart
curl --fail --silent --retry 8 --retry-connrefused --retry-delay 1 --max-time 5 http://127.0.0.1:4186/api/v2/health | "$node" --input-type=module -e 'let s="";for await(const c of process.stdin)s+=c;const h=JSON.parse(s);if(!h.ok||h.contentVersion!==2||!h.upgradeBackupReady)process.exit(1);console.log("Content v2 healthy; original database backup preserved.")'
printf 'Release completed. Site/runtime backups: %s\n' "$backup"
printf '%s\n' 'Players must individually consent before migration. Do not delete their backups.'
