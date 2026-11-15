"""Maintainer-run final cutover. Prepare the release before requesting approval.
No credentials are accepted by this script; operator passwords use the hidden CLI.
"""
from pathlib import Path
import argparse,datetime,json,os,shutil,sqlite3,subprocess,time,urllib.request
parser=argparse.ArgumentParser()
parser.add_argument('--stage',required=True,help='Complete staged directory containing site/ and runtime/')
args=parser.parse_args()
if os.geteuid()!=0: raise SystemExit('Final stop/start requires the maintainer-authorized administrator entrypoint.')
os.umask(0o077)
project=Path('/vol2/1000/Dockers/projects/Project_JiaoHun').resolve()
stage=Path(args.stage).resolve()
if stage.parent!=project or stage.name in ['site','runtime']: raise SystemExit('Stage must be a dedicated child of the named project directory')
required=['site/index.html','site/play.html','runtime/network-server.mjs','runtime/network/store.mjs','runtime/core/engine.mjs','runtime/core/save.mjs','runtime/tools/prepare-auth-v2.mjs','runtime/tools/operator-user.mjs']
for relative in required:
    p=stage/relative
    if not p.is_file() or p.is_symlink(): raise SystemExit('Missing or unsafe staged file: '+relative)
stamp=datetime.datetime.now().strftime('%Y%m%d%H%M%S')
audit=Path('/home/agent/jiaohun-audit')/('auth-v2-cutover-'+stamp);audit.mkdir(mode=0o700)
data=Path('/home/agent/jiaohun-game-data')
receipt={'time':stamp,'stage':str(stage),'audit':str(audit),'dataDeleted':False,'officialFnosChanged':False,'status':'prepared'}
unit=Path('/etc/systemd/system/game-save.service')
shutil.copy2(unit,audit/'game-save.service.before')
if 'GAME_INSECURE_TEST_COOKIE=1' in unit.read_text(): raise SystemExit('Production service must use Secure cookies')
subprocess.run(['systemctl','stop','game-save'],check=True)
old={name:project/(name+'.before-auth-v2-'+stamp) for name in ['site','runtime']}
swapped=[]
try:
    for name in ['progress.sqlite','progress-v2.sqlite']:
        path=data/name
        if path.exists():
            source=sqlite3.connect('file:'+str(path)+'?mode=ro',uri=True)
            target=sqlite3.connect(audit/name)
            try: source.backup(target)
            finally: target.close();source.close()
            os.chmod(audit/name,0o600)
    for name in ['site','runtime']:
        live=project/name
        if live.exists(): shutil.move(str(live),str(old[name]))
        shutil.move(str(stage/name),str(live));swapped.append(name)
    subprocess.run(['setfacl','-R','-m','u:svc-ai:r-X',str(project/'site')],check=True)
    subprocess.run(['runuser','-u','agent','--','/opt/node/bin/node',str(project/'runtime/tools/prepare-auth-v2.mjs'),'--data='+str(data)],check=True)
    subprocess.run(['systemctl','start','game-save'],check=True)
    healthy=False
    for _ in range(10):
        try:
            with urllib.request.urlopen('http://127.0.0.1:4186/api/v2/health',timeout=2) as response:
                healthy=json.load(response).get('ok') is True
            if healthy: break
        except Exception: time.sleep(1)
    if not healthy: raise RuntimeError('New API health check did not pass')
    receipt.update(status='active-v2',siteBackup=str(old['site']),runtimeBackup=str(old['runtime']),legacyRetained=True)
except BaseException:
    subprocess.run(['systemctl','stop','game-save'])
    for name in reversed(swapped):
        live=project/name
        if live.exists(): shutil.move(str(live),str(stage/(name+'.failed')))
        if old[name].exists(): shutil.move(str(old[name]),str(live))
    subprocess.run(['systemctl','start','game-save'])
    receipt['status']='rolled-back';(audit/'receipt.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2));raise
(audit/'receipt.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2))
print(json.dumps(receipt,ensure_ascii=False))
print('Initialize presenter and inspector with runtime/tools/operator-user.mjs in an interactive NAS terminal. No default passwords exist.')
