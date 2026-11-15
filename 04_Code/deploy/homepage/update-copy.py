from pathlib import Path
import datetime,shutil,json,hashlib
root=Path('/vol2/1000/Dockers/course_to_share/site')
changes=[]
for relative in ['index.html','course/paper-reading/index.html']:
    path=root/relative
    original=path.read_text()
    updated=original.replace('论文精读课','论文精读').replace('论文精读、方法笔记、课程讲解。','论文精读、方法笔记。')
    # The original media filename remains unchanged; only visible labels are renamed.
    updated=updated.replace('file:"论文精读_全片.mp4"','file:"论文精读课_全片.mp4"')
    if updated==original: continue
    backup=path.with_name(path.name+'.bak-copy-'+datetime.datetime.now().strftime('%Y%m%d%H%M%S'))
    shutil.copy2(path,backup)
    path.write_text(updated)
    changes.append({'file':str(path),'backup':str(backup),'replacedTitle':original.count('论文精读课'),'removedAboutPhrase':original.count('论文精读、方法笔记、课程讲解。'),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
audit=Path('/home/agent/jiaohun-audit/homepage-copy-'+datetime.datetime.now().strftime('%Y%m%d%H%M%S%f')+'.json')
audit.write_text(json.dumps({'time':datetime.datetime.now().astimezone().isoformat(),'account':'temporary sudoer via ask-root','purpose':'User-requested copy edits only','changes':changes,'serviceRestart':False,'credentialsLogged':False},ensure_ascii=False,indent=2))
print(json.dumps(changes,ensure_ascii=False))
