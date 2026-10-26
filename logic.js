(function(root){
 const OFFSET=8*3600000;
 function weekInfo(now=new Date()){
  const local=new Date(now.getTime()+OFFSET);
  const monday=new Date(Date.UTC(local.getUTCFullYear(),local.getUTCMonth(),local.getUTCDate()-((local.getUTCDay()+6)%7)));
  const end=new Date(monday.getTime()+6*86400000);
  const next=new Date(monday.getTime()+7*86400000);
  return {key:monday.toISOString().slice(0,10),start:`${monday.getUTCMonth()+1}.${monday.getUTCDate()}`,end:`${end.getUTCMonth()+1}.${end.getUTCDate()}`,next:`${next.getUTCMonth()+1}月${next.getUTCDate()}日`,resetAt:next.getTime()-OFFSET};
 }
 function normalize(data,now=new Date()){
  const week=weekInfo(now);
  return {week:week.key,used:Array.from({length:4},(_,i)=>data?.week===week.key && Number.isFinite(data?.used?.[i]) && data.used[i]>0 ? data.used[i] : null)};
 }
 root.Sips={weekInfo,normalize};
 if(typeof module!=='undefined')module.exports=root.Sips;
})(typeof window!=='undefined'?window:globalThis);
