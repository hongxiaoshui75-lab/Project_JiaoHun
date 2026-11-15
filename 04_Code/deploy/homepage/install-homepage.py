from pathlib import Path
import hashlib,shutil,datetime,json,os
root=Path('/vol2/1000/Dockers/projects/Project_JiaoHun/homepage-integration')
target=Path('/vol2/1000/Dockers/course_to_share/site/index.html')
audit=Path('/home/agent/jiaohun-audit/homepage-integration-20261115.json')
before=(root/'index.before.html').read_bytes()
if target.read_bytes()!=before: raise SystemExit('Homepage changed since inspection; re-read before writing')
new=(root/'index.html').read_bytes()
assert b'href="/game/"' in new and b'id="case-project"' in new
backup=target.with_name('index.html.bak-game-entry-'+datetime.datetime.now().strftime('%Y%m%d%H%M%S'))
shutil.copy2(target,backup)
target.write_bytes(new)
assert target.read_bytes()==new
audit.write_text(json.dumps({'time':datetime.datetime.now().astimezone().isoformat(),'account':'temporary sudoer via ask-root','action':'Add static /game/ navigation and project card to existing homepage','target':str(target),'backup':str(backup),'beforeSha256':hashlib.sha256(before).hexdigest(),'afterSha256':hashlib.sha256(new).hexdigest(),'serviceRestart':False,'credentialsLogged':False},ensure_ascii=False,indent=2))
os.chmod(audit,0o644)
print('HOMEPAGE_UPDATED backup='+str(backup)+' audit='+str(audit))
