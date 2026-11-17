import {decodeSave,encodeSave} from './save.mjs';
import {createGame,dispatch,getView} from './engine.mjs';
export function previewMigration(oldContent,newContent,raw){
 const old=decodeSave(oldContent,raw);
 if(oldContent.id!==newContent.id||oldContent.version>=newContent.version)throw Error('不是可迁移的旧版本存档');
 const targetStage='investigation';
 if(!newContent.stages[targetStage])throw Error('新版缺少保守迁移检查点');
 // Rebuild a valid checkpoint by normal transitions is content-specific; never
 // invent evidence/flags or silently write an unvalidated converted state.
 let state=createGame(newContent);
 for(let count=0;state.stageId!==targetStage&&count<1000;count++){
  const view=getView(newContent,state);
  if(view.kind!=='dialogue'||!view.dialogue)throw Error('新版前情不能安全到达首次调查，拒绝自动调查或举证');
  const result=dispatch(newContent,state,{type:'NEXT_DIALOGUE'});if(!result.ok)throw Error('迁移检查点重建失败');state=result.state;
 }
 if(state.stageId!==targetStage)throw Error('迁移检查点重建超出限制');
 const convertedSave=encodeSave(newContent,state);
 return {fromVersion:oldContent.version,toVersion:newContent.version,oldStage:old.stageId,targetStage,convertedSave,summary:'从首次调查重新查办，新版四轮会审需实际完成；保留旧档原件',requiresConsent:true};
}
