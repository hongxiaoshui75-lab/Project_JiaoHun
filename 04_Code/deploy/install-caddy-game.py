"""Run on NAS through the explicitly authorized ask-root entrypoint."""
from pathlib import Path
import datetime,shutil,subprocess
config=Path('/vol2/@team/agents/Dockers/frpc/Caddyfile')
snippet=Path('/vol2/1000/Dockers/projects/Project_JiaoHun/Caddy.game.snippet').read_text()
original=config.read_text()
marker='sociology.lumi-ember.xyz:8443, sociology.lumi-ember.top:8443 {'
if original.count(marker)!=1: raise SystemExit('Expected one existing sociology site')
if 'route /game/*' in original: raise SystemExit('Game route already exists; inspect instead of replacing')
backup=config.with_name(config.name+'.bak-game-'+datetime.datetime.now().strftime('%Y%m%d%H%M%S'))
shutil.copy2(config,backup)
candidate=original.replace(marker,marker+'\n'+snippet,1)
# Existing game-host stanza used an unregistered encoder; preserve gzip/zstd.
candidate=candidate.replace('encode min gzip zstd','encode gzip zstd')
restarted=False
try:
    # Allow only the static service identity to traverse the private project root.
    subprocess.run(['setfacl','-m','u:svc-ai:--x','/vol2/1000/Dockers/projects/Project_JiaoHun'],check=True)
    subprocess.run(['setfacl','-R','-m','u:svc-ai:r-X','/vol2/1000/Dockers/projects/Project_JiaoHun/site'],check=True)
    config.write_text(candidate)
    subprocess.run(['/home/svc-ai/bin/caddy','validate','--config',str(config),'--adapter','caddyfile'],check=True)
    # This Caddy has admin off, so reload via API is unavailable. Restart only this service.
    restarted=True
    subprocess.run(['systemctl','restart','caddy'],check=True)
    subprocess.run(['systemctl','is-active','--quiet','caddy'],check=True)
except BaseException:
    shutil.copy2(backup,config)
    if restarted: subprocess.run(['systemctl','restart','caddy'])
    raise
print('GAME_ROUTE_INSTALLED backup='+str(backup))
