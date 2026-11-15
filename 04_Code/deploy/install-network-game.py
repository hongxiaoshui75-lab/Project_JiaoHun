from pathlib import Path
import datetime,shutil,subprocess,json,os,pwd
stamp=datetime.datetime.now().strftime('%Y%m%d%H%M%S')
project=Path('/vol2/1000/Dockers/projects/Project_JiaoHun')
staged=project/'deploy-network-20261115';site=project/'site'
audit=Path('/home/agent/jiaohun-audit/network-game-'+stamp);audit.mkdir(mode=0o700)
config=Path('/vol2/@team/agents/Dockers/frpc/Caddyfile');original=config.read_text()
assert original.count('route /game/* {')==1
assert 'route /game/api/*' not in original, 'Already installed; inspect before updating'
api='''route /game/api/* {
    uri strip_prefix /game
    reverse_proxy 127.0.0.1:4186
}
'''
updated=original.replace('route /game/* {',api+'route /game/* {',1)
updated=updated.replace("img-src 'self';", "img-src 'self' data:;")
updated=updated.replace('root * /vol2/1000/Dockers/projects/Project_JiaoHun/09_Builds/JiaoHun_Demo/web\n\tfile_server','redir https://sociology.lumi-ember.top/game{uri} 308')
shutil.copy2(config,audit/'Caddyfile.before')
candidate=audit/'Caddyfile.candidate';candidate.write_text(updated)
subprocess.run(['/home/svc-ai/bin/caddy','validate','--config',str(candidate),'--adapter','caddyfile'],check=True,capture_output=True)
unit=Path('/etc/systemd/system/game-save.service')
if unit.exists():shutil.copy2(unit,audit/'game-save.service.before')
data=Path('/home/agent/jiaohun-game-data');data.mkdir(mode=0o700,exist_ok=True)
owner=pwd.getpwnam('agent');os.chown(data,owner.pw_uid,owner.pw_gid)
subprocess.run(['setfacl','-R','-m','u:svc-ai:r-X',str(staged/'site')],check=True)
old=project/('site.before-network-'+stamp)
shutil.move(str(site),str(old));shutil.move(str(staged/'site'),str(site))
shutil.copy2(staged/'game-save.service',unit)
subprocess.run(['systemctl','daemon-reload'],check=True)
try:
 subprocess.run(['systemctl','enable','--now','game-save'],check=True,capture_output=True)
 subprocess.run(['curl','--fail','--silent','--retry','5','--retry-delay','1','--retry-connrefused','http://127.0.0.1:4186/api/v1/health'],check=True,capture_output=True)
 config.write_text(updated);subprocess.run(['systemctl','restart','caddy'],check=True)
 subprocess.run(['systemctl','is-active','--quiet','caddy','game-save'],check=True)
except BaseException:
 config.write_text(original);subprocess.run(['systemctl','restart','caddy'])
 subprocess.run(['systemctl','disable','--now','game-save'])
 shutil.move(str(site),str(staged/'site.failed'));shutil.move(str(old),str(site));raise
receipt={'time':stamp,'site':str(site),'siteBackup':str(old),'database':str(data/'progress.sqlite'),'service':'game-save.service','listen':'127.0.0.1:4186','coreChanged':False,'officialFnosChanged':False,'reason':'Owner explicitly requested dynamic username-based automatic network saves, replacing prior static-only scope','audit':str(audit)}
(audit/'receipt.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2));print(json.dumps(receipt,ensure_ascii=False))
