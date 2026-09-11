import { FAMILIES, ITEMS, ODDS, ROSTER, RULES, TRAINERS, WISHES, XP, unitName } from './data';
import { synergies } from './combat';
import { next, random } from './random';
import type { Command, CombatResult, Game, Reward, Team, Unit } from './types';

export type Pool = Record<string,number>;
function draw(g:Game){const [seed,value]=next(g.seed);g.seed=seed;return value;}
export const benchCount=(g:Game)=>g.units.filter(u=>u.cell===null).length;
export const boardCount=(g:Game)=>g.units.filter(u=>u.cell!==null).length;
export const copies=(u:Unit)=>Math.pow(FAMILIES[u.family].legendary?2:3,u.star-1);
export const sellValue=(u:Unit)=>FAMILIES[u.family].cost*copies(u);
export const refreshCost=(g:Game)=>RULES.refreshCost-(g.wishes.includes('lucky')?1:0);
export const team=(g:Game):Team=>({units:g.units,trainer:g.trainer,empowered:g.empowered,trainerTarget:g.trainerTarget,wishes:g.wishes});
function makeUnit(g:Game,family:string,cell:number|null=null):Unit {return {uid:`u${++g.serial}`,family,star:1,cell,bond:0};}
export function rollShop(g:Game,pool?:Pool){
  const remaining=pool?{...pool}:undefined;
  return Array.from({length:5},()=>{
    const allowed=ROSTER.filter(f=>(!remaining||(remaining[f.id]??0)>0)&&(f.cost<4||g.round>=RULES.tier4Round)&&(!f.legendary||(g.legendary&&g.round>=RULES.legendaryRound)));
    const odds=ODDS[g.level];const tiers=[1,2,3,4,5].filter(t=>allowed.some(f=>f.cost===t)&&odds[t-1]>0);
    const sum=tiers.reduce((n,t)=>n+odds[t-1],0);if(!sum)return null;
    let r=draw(g)*sum;const tier=tiers.find(t=>(r-=odds[t-1])<0)??tiers[0];
    const options=allowed.filter(f=>f.cost===tier);const chosen=options[Math.floor(draw(g)*options.length)].id;
    if(remaining)remaining[chosen]--;return chosen;
  });
}
export function createGame(seed=Date.now()>>>0,trainer='red',legendary=false):Game {
  const g:Game={version:1,seed:seed>>>0,serial:0,round:1,phase:'prep',trainer:TRAINERS[trainer]?trainer:'red',gold:RULES.startingGold,hp:RULES.startingHp,level:3,xp:0,units:[],shop:[],locked:false,inventory:['muscle'],wishes:[],charge:0,empowered:false,seenTraits:[],streak:0,wins:0,losses:0,lastIncome:0,message:'Your first three partners are ready. Position your team, then enter the rift.',rewards:[],legendary,history:[]};
  const starters=ROSTER.filter(f=>f.cost===1).slice();for(const cell of [23,25,31]){const idx=Math.floor(draw(g)*starters.length);g.units.push(makeUnit(g,starters.splice(idx,1)[0].id,cell));}g.shop=rollShop(g);return g;
}
function merge(g:Game){
  let changed=true;while(changed){changed=false;
    for(const f of ROSTER.filter(f=>!f.utility))for(const star of [1,2]){
      const needed=f.legendary?2:3;
      const matches=g.units.filter(u=>u.family===f.id&&u.star===star).sort((a,b)=>Number(a.cell===null)-Number(b.cell===null)||a.uid.localeCompare(b.uid));
      if(matches.length<needed)continue;
      const consumed=matches.slice(0,needed),keep=consumed[0];keep.star++;keep.bond=Math.max(...consumed.map(u=>u.bond));
      for(const u of consumed.slice(1)){if(u.item){if(!keep.item)keep.item=u.item;else g.inventory.push(u.item);}g.units=g.units.filter(x=>x.uid!==u.uid);}
      g.message=`Evolution! ${unitName(keep.family,keep.star)} reached ${keep.star} stars.`;changed=true;
    }
  }
}
function redReward(g:Game){if(g.trainer!=='red')return;for(const trait of synergies(g.units,g.wishes))if(trait.category==='type'&&trait.tier&&!g.seenTraits.includes(trait.id)){g.seenTraits.push(trait.id);g.gold++;}}
function fail(g:Game,message:string){return {...g,message};}
export function command(source:Game,action:Command,pool?:Pool):Game {
  if(source.phase==='finished'||source.phase==='combat'||source.phase==='result')return fail(source,'Wait until preparation to change your team.');
  const g=structuredClone(source);g.message='';
  if(action.type==='reward'){
    if(g.phase!=='reward')return fail(source,'There is no reward to claim.');const reward=g.rewards.find(r=>r.id===action.id);if(!reward)return fail(source,'Choose one of the available rewards.');
    if(reward.kind==='item')g.inventory.push(String(reward.value));if(reward.kind==='wish')g.wishes.push(String(reward.value));if(reward.kind==='gold')g.gold+=Number(reward.value);if(reward.kind==='heal')g.hp=Math.min(100,g.hp+Number(reward.value));
    g.rewards=[];g.phase='prep';g.message=`Claimed ${reward.name}.`;return g;
  }
  if(g.phase!=='prep')return fail(source,'Choose your cosmic reward first.');
  if(action.type==='buy'){
    if(!Number.isInteger(action.slot)||action.slot<0||action.slot>4)return fail(source,'Invalid shop slot.');
    const id=g.shop[action.slot];if(!id)return fail(source,'That offer has already been bought.');const f=FAMILIES[id];if(g.gold<f.cost)return fail(source,'Not enough gold. Save for next round or sell a reserve.');
    g.units.push(makeUnit(g,id));g.gold-=f.cost;g.shop[action.slot]=null;g.message=`${f.names[0]} joined your bench.`;merge(g);
    if(benchCount(g)>RULES.bench)return fail(source,'Your bench is full. Deploy or sell a Pokémon first.');
  }else if(action.type==='move'){
    const u=g.units.find(u=>u.uid===action.uid);if(!u)return fail(source,'Select a Pokémon first.');
    if(action.cell!==null&&(!Number.isInteger(action.cell)||action.cell<21||action.cell>41))return fail(source,'Place your team on the lower half of the board.');
    if(FAMILIES[u.family].utility&&action.cell!==null)return fail(source,'Ditto belongs on the bench. Use Transform on a bench partner.');
    const other=action.cell===null?undefined:g.units.find(v=>v.cell===action.cell&&v.uid!==u.uid);
    if(other)other.cell=u.cell;u.cell=action.cell;
    if(boardCount(g)>g.level)return fail(source,`Team limit is ${g.level}. Buy XP to add another Pokémon.`);
    if(benchCount(g)>RULES.bench)return fail(source,'Your bench is full. Sell a reserve to make room.');
    g.message=`${unitName(u.family,u.star)} ${u.cell===null?'returned to the bench':'is in position'}.`;
  }else if(action.type==='sell'){
    const u=g.units.find(u=>u.uid===action.uid);if(!u)return fail(source,'Select a Pokémon to sell.');g.gold+=sellValue(u);if(u.item)g.inventory.push(u.item);g.units=g.units.filter(v=>v.uid!==u.uid);g.message=`Sold ${unitName(u.family,u.star)} for ${sellValue(u)} gold.`;
  }else if(action.type==='refresh'){
    const cost=refreshCost(g);if(g.gold<cost)return fail(source,'Not enough gold to refresh.');g.gold-=cost;g.shop=rollShop(g,pool);g.message='A new signal from the wormhole.';
  }else if(action.type==='xp'){
    if(g.level>=RULES.maxLevel)return fail(source,'You have reached the maximum level.');if(g.gold<RULES.xpCost)return fail(source,'You need 4 gold to buy XP.');g.gold-=RULES.xpCost;g.xp+=RULES.xpGain;levelUp(g);g.message=`Training complete. Level ${g.level}, ${g.xp} XP.`;
  }else if(action.type==='lock'){g.locked=!g.locked;g.message=g.locked?'Shop locked for the next round.':'Shop unlocked.';}
  else if(action.type==='equip'){
    const u=g.units.find(u=>u.uid===action.uid),idx=g.inventory.indexOf(action.item);if(!u||idx<0||!ITEMS[action.item]||FAMILIES[u.family].utility)return fail(source,'Select a combat Pokémon and an available item.');if(u.item)g.inventory.push(u.item);u.item=action.item;g.inventory.splice(idx,1);g.message=`Equipped ${ITEMS[action.item].name}.`;
  }else if(action.type==='unequip'){
    const u=g.units.find(u=>u.uid===action.uid);if(!u?.item)return fail(source,'This Pokémon has no held item.');g.inventory.push(u.item);delete u.item;g.message='Held item returned to your bag.';
  }else if(action.type==='ditto'){
    const ditto=g.units.find(u=>u.uid===action.uid),target=g.units.find(u=>u.uid===action.target);
    if(!ditto||ditto.family!=='ditto'||!target||target.cell!==null||FAMILIES[target.family].legendary||FAMILIES[target.family].utility)return fail(source,'Ditto can copy a non-Legendary Pokémon on your bench.');
    ditto.family=target.family;ditto.star=1;ditto.bond=0;g.message=`Ditto transformed into ${unitName(target.family)}!`;merge(g);
  }else if(action.type==='power'){
    if(g.charge<3||g.empowered)return fail(source,'Your trainer needs 3 charges. Gain charges after each battle.');
    if(g.trainer==='cynthia'&&!g.units.some(u=>u.uid===action.uid&&u.cell!==null))return fail(source,'Select a deployed Pokémon for Cynthia to empower.');
    g.charge=0;
    if(g.trainer==='may'){g.gold+=3;g.shop=rollShop(g,pool);g.message='Exploration: +3 gold and a fresh shop.';}
    else {g.empowered=true;g.trainerTarget=action.uid;g.message=`${TRAINERS[g.trainer].name} is ready to empower your next battle.`;}
  }
  redReward(g);return g;
}
function levelUp(g:Game){while(g.level<RULES.maxLevel&&g.xp>=XP[g.level]){g.xp-=XP[g.level];g.level++;}}
export function enemyFor(g:Game):Team {
  const rng=random(g.seed^Math.imul(g.round,7937)), count=Math.min(9,2+Math.floor(g.round/2));
  const allowed=ROSTER.filter(f=>!f.utility&&!f.legendary&&f.cost<=Math.min(4,1+Math.floor(g.round/4)));
  const cells=[23,25,24,30,32,31,37,39,38];const units:Unit[]=Array.from({length:count},(_,i)=>({uid:`e${i}`,family:allowed[Math.floor(rng()*allowed.length)].id,star:g.round>=12?2:g.round>=7&&i<2?2:1,cell:cells[i],bond:0}));
  if(g.round===15)units[0]={...units[0],family:'rayquaza',star:2};
  return {units,trainer:'',empowered:false,wishes:[]};
}
export const encounterName=(round:number)=>round===15?'Rayquaza · Rift guardian':round<=2?'Wild orbit':round%5===0?'Wormhole guardian':['Ace Nova','Astral Scout','Ranger Sol','Pilot Lyra'][(round-3)%4];
export function settle(source:Game,result:CombatResult):Game {
  if(source.phase!=='combat')return source;const g=structuredClone(source);g.lastResult=result;g.phase='result';
  const win=result.winner===0,draw=result.winner==='draw';const damage=win?0:draw?3:Math.min(25,4+Math.floor(g.round/3)+result.survivors*2);
  g.hp=Math.max(0,g.hp-damage);if(win){g.wins++;g.streak=g.streak>0?g.streak+1:1;}else{g.losses++;g.streak=g.streak<0?g.streak-1:-1;}
  const interest=Math.min(g.wishes.includes('interest')?7:RULES.interestCap,Math.floor(g.gold/10));const streak=Math.min(3,Math.floor(Math.abs(g.streak)/3));
  g.lastIncome=RULES.baseIncome+interest+streak+(win?1:0)+(g.trainer==='may'&&g.round%3===0?2:0);g.gold+=g.lastIncome;g.xp+=2;levelUp(g);
  g.charge=Math.min(3,g.charge+1+(g.wishes.includes('bond')?1:0));g.empowered=false;delete g.trainerTarget;
  const survivors=result.frames.at(-1)?.fighters.filter(f=>f.side===0&&f.hp>0).map(f=>f.uid.slice(2))||[];
  g.units.forEach(u=>u.bond=survivors.includes(u.uid)?Math.min(5,u.bond+1):0);
  g.history.push({round:g.round,outcome:win?'Victory':draw?'Draw':'Defeat',damage});
  g.message=win?`Victory! +${g.lastIncome} gold income.`:`${draw?'Draw':'Defeat'}. Lost ${damage} HP. +${g.lastIncome} gold to rebuild.`;return g;
}
function rewards(g:Game):Reward[]{
  const choices:Reward[]=[...Object.entries(ITEMS).map(([id,i])=>({id:`item-${id}`,kind:'item' as const,name:i.name,description:i.description,value:id})),...Object.entries(WISHES).filter(([id])=>!g.wishes.includes(id)).map(([id,w])=>({id:`wish-${id}`,kind:'wish' as const,name:w.name,description:w.description,value:id})),{id:'gold',kind:'gold',name:'Starfall fortune',description:'Gain 10 gold. A little room to dream.',value:10},{id:'heal',kind:'heal',name:'A quiet constellation',description:'Restore 15 player HP, up to 100.',value:15}];
  return Array.from({length:3},()=>choices.splice(Math.floor(draw(g)*choices.length),1)[0]);
}
export function advance(source:Game,pool?:Pool,finishAt=RULES.maxRounds):Game {
  if(source.phase!=='result')return source;const g=structuredClone(source);
  if(g.hp<=0||g.round>=finishAt){g.phase='finished';return g;}
  const cosmic=g.round%3===0;g.round++;g.phase=cosmic?'reward':'prep';g.lastResult=undefined;g.message=cosmic?'The cosmos offers a choice. Pick one reward.':'A new round. Scout the enemy and prepare your team.';
  if(!g.locked)g.shop=rollShop(g,pool);g.locked=false;if(cosmic)g.rewards=rewards(g);return g;
}
export function validSave(value:unknown):value is Game {
  // Local saves are versioned and untrusted. Never accepted by the multiplayer server.
  if(!value||typeof value!=='object')return false;const g=value as Game;
  if(g.version!==1||!TRAINERS[g.trainer]||!['prep','combat','result','reward','finished'].includes(g.phase)||!Array.isArray(g.units)||!Array.isArray(g.shop)||g.shop.length!==5)return false;
  if(!['seed','serial','round','gold','hp','level','xp','charge','streak','wins','losses','lastIncome'].every(k=>Number.isFinite(g[k as keyof Game])))return false;
  if(g.level<3||g.level>9||g.round<1||g.round>15||g.hp<0||g.hp>100||g.gold<0)return false;
  if(!Array.isArray(g.inventory)||!g.inventory.every(i=>ITEMS[i])||!Array.isArray(g.wishes)||!g.wishes.every(w=>WISHES[w])||!Array.isArray(g.history)||!Array.isArray(g.rewards)||!Array.isArray(g.seenTraits))return false;
  if(!g.shop.every(id=>id===null||FAMILIES[id]))return false;
  const cells=new Set<number>(),ids=new Set<string>();
  for(const u of g.units){if(!FAMILIES[u.family]||typeof u.uid!=='string'||ids.has(u.uid)||![1,2,3].includes(u.star)||!Number.isFinite(u.bond)||(u.item&&!ITEMS[u.item]))return false;ids.add(u.uid);if(u.cell!==null){if(!Number.isInteger(u.cell)||u.cell<21||u.cell>41||cells.has(u.cell)||FAMILIES[u.family].utility)return false;cells.add(u.cell);}}
  return benchCount(g)<=9&&boardCount(g)<=g.level;
}
