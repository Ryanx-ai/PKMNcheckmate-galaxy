import { FAMILIES, ITEMS, RULES, TRAITS } from './data';
import { random } from './random';
import type { BattleEvent, CombatResult, Fighter, Frame, Team, Unit } from './types';

export function synergies(units: Unit[], wishes: string[] = []) {
  const unique = [...new Set(units.filter(u=>u.cell!==null && !FAMILIES[u.family].utility).map(u=>u.family))];
  return TRAITS.map(trait=>{ const count=unique.filter(id=>FAMILIES[id].traits.includes(trait.id)).length+(trait.id==='Dragon'&&wishes.includes('dragon')?1:0); const tier=trait.thresholds.filter(n=>count>=n).length; return {...trait,count,tier}; }).filter(t=>t.count>0).sort((a,b)=>b.tier-a.tier || b.count-a.count || a.id.localeCompare(b.id));
}
const distance = (a:{x:number;y:number},b:{x:number;y:number})=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
const key=(x:number,y:number)=>`${x},${y}`;
const neighbors=(x:number,y:number)=>[[x,y-1],[x-1,y],[x+1,y],[x,y+1]].filter(([a,b])=>a>=0&&a<7&&b>=0&&b<6);
export function battleStats(unit:Unit,team:Team) {
  const f=FAMILIES[unit.family]; const scale=[1,1.8,3.24][unit.star-1]*(f.legendary&&unit.star===3?1.5:1);
  const stats={...f.stats,hp:Math.round(f.stats.hp*scale),attack:Math.round(f.stats.attack*scale),special:Math.round(f.stats.special*scale)};
  for(const trait of synergies(team.units,team.wishes)) if(trait.tier && f.traits.includes(trait.id)) stats[trait.stat]+=trait.values[trait.tier-1];
  if(unit.item) for(const [k,v] of Object.entries(ITEMS[unit.item].stats)) stats[k as keyof typeof stats]+=v;
  if(team.wishes.includes('growth')) stats.hp*=1.2;
  if(team.trainer==='cynthia'&&f.cost>=3) stats.hp*=1.1;
  if(team.trainer==='n')stats.hp*=1+Math.min(5,unit.bond)*0.03;
  if(team.empowered) {
    const carry=team.units.filter(u=>u.cell!==null).slice().sort((a,b)=>b.star-a.star||FAMILIES[b.family].cost-FAMILIES[a.family].cost||a.uid.localeCompare(b.uid))[0];
    if(team.trainer==='red'&&unit.uid===carry?.uid){stats.attack*=1.35;stats.special*=1.35;}
    if(team.trainer==='cynthia'&&unit.uid===(team.trainerTarget||carry?.uid)){stats.hp*=1.4;stats.defense+=25;}
  }
  stats.hp=Math.round(stats.hp);return stats;
}
function makeFighters(team:Team,side:0|1):Fighter[] {
  return team.units.filter(u=>u.cell!==null&&!FAMILIES[u.family].utility).map(u=>{
    const stats=battleStats(u,team); const c=u.cell!; const x=c%7,y=Math.floor(c/7);
    return {...u,...stats,uid:`${side}:${u.uid}`,side,x:side===0?x:6-x,y:side===0?y:5-y,maxHp:stats.hp,energy:stats.startingEnergy,cooldown:0,shield:(u.item&&ITEMS[u.item].effect==='shield'?200:0)+(team.trainer==='n'&&team.empowered?150:0),statuses:[],damage:0,casts:0,hit:0,focusUsed:false,revived:false};
  });
}
export function simulate(left:Team,right:Team,seed:number,enemyName='Wormhole encounter'):CombatResult {
  const rng=random(seed), fighters=[...makeFighters(left,0),...makeFighters(right,1)];
  const frames:Frame[]=[], revived=[false,false];let events:BattleEvent[]=[];
  const living=(side:number)=>fighters.filter(f=>f.side===side&&f.hp>0);
  const record=(tick:number)=>frames.push({tick,fighters:structuredClone(fighters),events:structuredClone(events)});
  const heal=(f:Fighter,amount:number)=>{const value=Math.min(f.maxHp-f.hp,Math.round(amount));if(value>0){f.hp+=value;events.push({kind:'heal',source:f.uid,value});}};
  const defeat=(t:Fighter)=>{
    if(t.hp>0)return;
    if(!revived[t.side]&&[left,right][t.side].wishes.includes('wind')){revived[t.side]=true;t.revived=true;t.hp=Math.round(t.maxHp*0.25);t.statuses=[];events.push({kind:'heal',source:t.uid,value:t.hp,label:'Second Wind'});}
    else {t.hp=0;events.push({kind:'defeat',source:t.uid});}
  };
  const hit=(s:Fighter,t:Fighter,raw:number,special:boolean,label?:string)=>{
    if(t.hp<=0)return;
    const value=Math.max(1,Math.round(raw*100/(100+(special?t.resistance:t.defense))));
    const absorbed=Math.min(t.shield,value);t.shield-=absorbed;const dealt=Math.min(t.hp,value-absorbed);t.hp-=dealt;s.damage+=dealt;t.energy=Math.min(t.maxEnergy,t.energy+t.energyOnDamage);t.hit++;
    events.push({kind:label?'ultimate':'attack',source:s.uid,target:t.uid,value:dealt,label});
    if(s.item&&ITEMS[s.item].effect==='leech'&&s.hp>0)heal(s,dealt*0.15);
    if(!special&&t.item&&ITEMS[t.item].effect==='reflect'){s.hp=Math.max(0,s.hp-Math.round(dealt*0.15));defeat(s);}
    if(t.item&&ITEMS[t.item].effect==='focus'&&!t.focusUsed&&t.hp>0&&t.hp<t.maxHp*0.3){t.focusUsed=true;heal(t,t.maxHp*0.3);}
    defeat(t);
  };
  const winner=():0|1|'draw'|undefined=>!living(0).length&&!living(1).length?'draw':!living(1).length?0:!living(0).length?1:undefined;
  record(0);let result=winner();
  for(let tick=1;tick<=RULES.ticks&&result===undefined;tick++) {
    events=[];
    // Rotate initiative deterministically each tick; neither side owns all first attacks.
    const order=tick%2?fighters.slice():fighters.slice().reverse();
    for(const actor of order){
      if(actor.hp<=0)continue;
      for(const status of actor.statuses){if(status.kind==='burn'){actor.hp=Math.max(0,actor.hp-status.power);defeat(actor);}status.ticks--;}
      const stunned=actor.statuses.some(s=>s.kind==='stun'&&s.ticks>0);
      const slowed=actor.statuses.some(s=>s.kind==='slow'&&s.ticks>0);
      actor.statuses=actor.statuses.filter(s=>s.ticks>0);
      if(actor.hp<=0)continue;
      if(actor.regen)actor.hp=Math.min(actor.maxHp,actor.hp+actor.regen*RULES.tickSeconds);
      actor.cooldown-=RULES.tickSeconds*(slowed?0.6:1);
      if(stunned||actor.cooldown>0)continue;
      const f=FAMILIES[actor.family];
      const enemies=living(1-actor.side).sort((a,b)=>f.targeting==='weakest'?a.hp/a.maxHp-b.hp/b.maxHp||distance(actor,a)-distance(actor,b)||a.uid.localeCompare(b.uid):distance(actor,a)-distance(actor,b)||a.uid.localeCompare(b.uid));
      const target=enemies[0];if(!target)continue;
      if(actor.energy>=actor.maxEnergy){
        actor.energy=Math.max(0,actor.energy-actor.ultimateCost);actor.casts++;actor.cooldown=1/actor.speed;
        events.push({kind:'ultimate',source:actor.uid,label:f.move});
        const physical=f.role==='Speedster'||f.role==='All-Rounder'; const raw=(physical?actor.attack:actor.special)*f.power;
        if(f.effect==='heal'){const allies=living(actor.side).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp);for(const ally of allies.slice(0,3))heal(ally,raw);}
        else {
          if(f.effect==='ambush') {const occupied=new Set(fighters.filter(a=>a.hp>0&&a.uid!==actor.uid).map(a=>key(a.x,a.y)));const cell=neighbors(target.x,target.y).find(([x,y])=>!occupied.has(key(x,y)));if(cell){actor.x=cell[0];actor.y=cell[1];}}
          const targets=f.effect==='storm'?enemies:f.effect==='chain'?enemies.slice(0,3):['blast','burn','slow'].includes(f.effect)?enemies.filter(t=>distance(t,target)<=1):[target];
          for(const t of targets){hit(actor,t,raw,!physical,f.move);if(t.hp>0&&['burn','slow','stun'].includes(f.effect))t.statuses.push({kind:f.effect as 'burn'|'slow'|'stun',ticks:f.effect==='stun'?4:12,power:f.effect==='burn'?Math.max(1,Math.round(actor.special*0.04)):0});}
          if(f.effect==='drain')heal(living(actor.side).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0]||actor,raw*0.8);
          if(f.effect==='shield')actor.shield+=raw;
          if(f.effect==='knockback'&&target.hp>0){const occupied=new Set(fighters.filter(a=>a.hp>0).map(a=>key(a.x,a.y)));const cell=neighbors(target.x,target.y).filter(([x,y])=>!occupied.has(key(x,y))).sort((a,b)=>distance(actor,{x:b[0],y:b[1]})-distance(actor,{x:a[0],y:a[1]}))[0];if(cell){target.x=cell[0];target.y=cell[1];}}
        }
      }else if(distance(actor,target)<=actor.range){
        hit(actor,target,actor.attack*(rng()<actor.crit?1.5:1),false);
        actor.energy=Math.min(actor.maxEnergy,actor.energy+actor.energyPerAttack);actor.cooldown=1/actor.speed;
      }else{
        const occupied=new Set(fighters.filter(a=>a.hp>0&&a.uid!==actor.uid).map(a=>key(a.x,a.y)));
        const queue:{x:number;y:number;first?:number[]}[]=[{x:actor.x,y:actor.y}],seen=new Set([key(actor.x,actor.y)]);let step:number[]|undefined;
        for(let i=0;i<queue.length;i++){const p=queue[i];if(p.first&&distance(p,target)<=actor.range){step=p.first;break;}for(const [x,y] of neighbors(p.x,p.y)){const k=key(x,y);if(!occupied.has(k)&&!seen.has(k)){seen.add(k);queue.push({x,y,first:p.first||[x,y]});}}}
        if(step){actor.x=step[0];actor.y=step[1];events.push({kind:'move',source:actor.uid});}actor.cooldown=0.35;
      }
    }
    result=winner();record(tick);
  }
  return {winner:result??'draw',frames,survivors:living(1).length,seed,enemyName};
}
