import type { Effect, Family, Role, Stats } from './types';

export const RULES = { columns: 7, rows: 6, bench: 9, startingGold: 10, startingHp: 100, baseIncome: 5, refreshCost: 2, xpCost: 4, xpGain: 4, interestCap: 5, maxLevel: 9, maxRounds: 15, tier4Round: 6, legendaryRound: 11, ticks: 240, tickSeconds: 0.25, poolCopies: [0, 30, 24, 18, 12, 6] };
export const XP = [0, 0, 0, 6, 10, 18, 28, 40, 56, 999];
export const ODDS: Record<number, number[]> = { 3: [75,25,0,0,0], 4: [55,30,15,0,0], 5: [40,35,20,5,0], 6: [30,35,25,10,0], 7: [20,30,30,19,1], 8: [15,20,30,32,3], 9: [10,15,25,44,6] };
const roles: Record<Role, [number,number,number,number,number,number,number]> = {
  Defender: [850,48,55,55,40,0.7,1], Attacker: [490,52,20,85,25,0.85,3],
  Speedster: [540,78,25,65,22,1.15,1], 'All-Rounder': [690,78,40,60,30,0.85,1], Supporter: [620,35,30,70,40,0.8,3]
};
function family(id: string, names: string[], dex: number[], cost: number, role: Role, types: string[], move: string, effect: Effect, power = 1.8): Family {
  const [hp,attack,defense,special,resistance,speed,range] = roles[role]; const scale = 1 + (cost-1)*0.17;
  return { id,names,dex,cost,role,traits:[...types,role],move,effect,power,legendary:cost===5,targeting:effect==='ambush'?'weakest':'nearest',stats:{hp:Math.round(hp*scale),attack:Math.round(attack*scale),defense,special:Math.round(special*scale),resistance,speed,range,crit:0.1,regen:0,startingEnergy:0,energyPerAttack:20,energyOnDamage:5,maxEnergy:100,ultimateCost:100} };
}
export const ROSTER: Family[] = [
  family('bulbasaur',['Bulbasaur','Ivysaur','Venusaur'],[1,2,3],1,'Supporter',['Grass','Poison'],'Giga Drain','drain'),
  family('charmander',['Charmander','Charmeleon','Charizard'],[4,5,6],1,'Attacker',['Fire','Flying'],'Flamethrower','burn'),
  family('squirtle',['Squirtle','Wartortle','Blastoise'],[7,8,9],1,'Defender',['Water'],'Hydro Pump','knockback'),
  family('pichu',['Pichu','Pikachu','Raichu'],[172,25,26],1,'Attacker',['Electric'],'Thunder','chain'),
  family('machop',['Machop','Machoke','Machamp'],[66,67,68],1,'All-Rounder',['Fighting'],'Dynamic Barrage','stun',2.4),
  family('gastly',['Gastly','Haunter','Gengar'],[92,93,94],1,'Speedster',['Ghost','Poison'],'Shadow Ambush','ambush',2.7),
  family('ralts',['Ralts','Kirlia','Gardevoir'],[280,281,282],2,'Attacker',['Psychic','Fairy'],'Psychic Collapse','blast',2.4),
  family('riolu',['Riolu','Lucario','Lucario'],[447,448,448],2,'All-Rounder',['Fighting','Steel'],'Aura Sphere','blast',2.2),
  family('togepi',['Togepi','Togetic','Togekiss'],[175,176,468],2,'Supporter',['Fairy','Flying'],'Life Dew','heal',2.6),
  family('magnemite',['Magnemite','Magneton','Magnezone'],[81,82,462],2,'Attacker',['Electric','Steel'],'Discharge','chain',2.2),
  family('swinub',['Swinub','Piloswine','Mamoswine'],[220,221,473],2,'Defender',['Ice','Ground'],'Icicle Crash','slow',2),
  family('fletchling',['Fletchling','Fletchinder','Talonflame'],[661,662,663],2,'Speedster',['Fire','Flying'],'Brave Bird','ambush',3),
  family('treecko',['Treecko','Grovyle','Sceptile'],[252,253,254],3,'Speedster',['Grass'],'Leaf Blade','ambush',3),
  family('mudkip',['Mudkip','Marshtomp','Swampert'],[258,259,260],3,'Defender',['Water','Ground'],'Muddy Water','shield',2.3),
  family('beldum',['Beldum','Metang','Metagross'],[374,375,376],3,'All-Rounder',['Steel','Psychic'],'Meteor Mash','stun',2.6),
  family('gible',['Gible','Gabite','Garchomp'],[443,444,445],3,'All-Rounder',['Dragon','Ground'],'Dragon Rush','knockback',2.8),
  family('litwick',['Litwick','Lampent','Chandelure'],[607,608,609],3,'Attacker',['Ghost','Fire'],'Inferno','burn',2.8),
  family('froakie',['Froakie','Frogadier','Greninja'],[656,657,658],3,'Speedster',['Water','Dark'],'Water Shuriken','chain',2.6),
  family('larvitar',['Larvitar','Pupitar','Tyranitar'],[246,247,248],4,'Defender',['Rock','Dark'],'Sandstorm','storm',1.4),
  family('bagon',['Bagon','Shelgon','Salamence'],[371,372,373],4,'Attacker',['Dragon','Flying'],'Draco Meteor','blast',3),
  family('dreepy',['Dreepy','Drakloak','Dragapult'],[885,886,887],4,'Speedster',['Dragon','Ghost'],'Dragon Darts','chain',3),
  family('deino',['Deino','Zweilous','Hydreigon'],[633,634,635],4,'Attacker',['Dark','Dragon'],'Dark Pulse','chain',3),
  family('goomy',['Goomy','Sliggoo','Goodra'],[704,705,706],4,'Defender',['Dragon'],'Regeneration','heal',3.5),
  family('frigibax',['Frigibax','Arctibax','Baxcalibur'],[996,997,998],4,'All-Rounder',['Dragon','Ice'],'Glaive Rush','stun',3),
  {...family('ditto',['Ditto','Ditto','Ditto'],[132,132,132],4,'Supporter',['Normal'],'Transform','heal'),utility:true},
  family('mewtwo',['Mewtwo','Mewtwo','Mewtwo'],[150,150,150],5,'Attacker',['Psychic'],'Psystrike','blast',4),
  family('reshiram',['Reshiram','Reshiram','Reshiram'],[643,643,643],5,'Attacker',['Dragon','Fire'],'Blue Flare','burn',4),
  family('zekrom',['Zekrom','Zekrom','Zekrom'],[644,644,644],5,'All-Rounder',['Dragon','Electric'],'Bolt Strike','chain',4),
  family('rayquaza',['Rayquaza','Rayquaza','Rayquaza'],[384,384,384],5,'Speedster',['Dragon','Flying'],'Dragon Ascent','storm',3.2)
];
export const FAMILIES = Object.fromEntries(ROSTER.map(f=>[f.id,f]));
export type Modifier = Partial<Stats>;
export type Trait = { id: string; category: 'type'|'role'|'season'; thresholds: number[]; stat: keyof Stats; values: number[]; description: string; color: string };
const trait = (id:string,stat:keyof Stats,values:number[],description:string,color:string,category:Trait['category']='type'): Trait => ({id,stat,values,description,color,thresholds:[2,4,6].slice(0,values.length),category});
export const TRAITS: Trait[] = [
  trait('Fire','attack',[15,35,65],'Attack +15 / 35 / 65','#ff996e'),trait('Water','energyPerAttack',[5,10,15],'Energy per attack +5 / 10 / 15','#72c3ff'),
  trait('Grass','regen',[8,20],'Heal 8 / 20 HP each second','#8dddac'),trait('Electric','speed',[0.15,0.35],'Attack speed +0.15 / 0.35','#f7d777'),
  trait('Ghost','crit',[0.15,0.3],'Critical chance +15% / 30%','#b6a4fa'),trait('Poison','special',[15,40],'Sp. Attack +15 / 40','#cd8ad9'),
  trait('Dragon','special',[20,45,80],'Sp. Attack +20 / 45 / 80','#aaa4ff'),trait('Steel','defense',[20,45],'Defense +20 / 45','#b3c8d9'),
  trait('Psychic','startingEnergy',[20,40],'Starting energy +20 / 40','#f4a3cf'),trait('Fighting','attack',[20,45],'Attack +20 / 45','#e7a788'),
  trait('Ice','defense',[15,35],'Defense +15 / 35','#9be9ef'),trait('Ground','hp',[140,300],'HP +140 / 300','#dfba8b'),
  trait('Dark','crit',[0.15,0.3],'Critical chance +15% / 30%','#b9add1'),trait('Fairy','resistance',[25,50],'Sp. Defense +25 / 50','#f1b0dd'),
  trait('Flying','speed',[0.12,0.3,0.5],'Attack speed +0.12 / 0.30 / 0.50','#a8c3ff'),trait('Rock','defense',[25],'Defense +25','#d3bf97'),
  trait('Attacker','special',[15,35,60],'Sp. Attack +15 / 35 / 60','#ffb188','role'),trait('Defender','hp',[150,350,600],'HP +150 / 350 / 600','#8dbfe5','role'),
  trait('Supporter','regen',[10,25],'Heal 10 / 25 HP each second','#a2e3bb','role'),trait('Speedster','speed',[0.15,0.35,0.6],'Attack speed +0.15 / 0.35 / 0.60','#d0acf7','role'),
  trait('All-Rounder','attack',[15,35,60],'Attack +15 / 35 / 60','#efb76e','role')
];
export const ITEMS: Record<string,{name:string;description:string;stats:Modifier;effect?:'focus'|'reflect'|'shield'|'leech'}> = {
  muscle:{name:'Muscle Band',description:'+20 Attack and +0.15 attack speed.',stats:{attack:20,speed:0.15}},
  glasses:{name:'Wise Glasses',description:'+40 Sp. Attack.',stats:{special:40}},
  leftovers:{name:'Leftovers',description:'Restore 18 HP per second.',stats:{regen:18}},
  focus:{name:'Focus Band',description:'Once per battle, heal 30% HP below 30% health.',stats:{hp:80},effect:'focus'},
  scope:{name:'Scope Lens',description:'+30% critical chance. Critical hits deal 150% damage.',stats:{crit:0.3}},
  claw:{name:'Quick Claw',description:'+0.35 attack speed.',stats:{speed:0.35}},
  helmet:{name:'Rocky Helmet',description:'+30 Defense. Reflect 15% of physical damage.',stats:{defense:30},effect:'reflect'},
  vest:{name:'Assault Vest',description:'+35 Sp. Defense. Begin with a 200 HP shield.',stats:{resistance:35},effect:'shield'},
  amplifier:{name:'Energy Amplifier',description:'+20 starting energy, +10 energy per attack.',stats:{startingEnergy:20,energyPerAttack:10}},
  bell:{name:'Shell Bell',description:'Heal for 15% of damage dealt.',stats:{special:15},effect:'leech'}
};
export const WISHES: Record<string,{name:string;description:string}> = {
  growth:{name:'Stellar Growth',description:'Your entire team gains 20% maximum HP.'},
  dragon:{name:"Dragon’s Call",description:'Your team counts as having one extra Dragon.'},
  lucky:{name:'Lucky Star',description:'Shop refreshes cost 1 less gold for this run.'},
  interest:{name:'Cosmic Interest',description:'Interest cap rises from 5 to 7 gold.'},
  wind:{name:'Second Wind',description:'The first fallen ally revives with 25% HP each battle.'},
  bond:{name:"Trainer’s Bond",description:'Gain an extra trainer charge after every battle.'}
};
export const TRAINERS: Record<string,{name:string;region:string;title:string;color:string;passive:string;power:string}> = {
  red:{name:'Red',region:'Kanto',title:'The original champion',color:'#ed8c8b',passive:'Earn 1 gold the first time you activate each type synergy.',power:'Your highest-star ally gains 35% Attack and Sp. Attack next battle.'},
  cynthia:{name:'Cynthia',region:'Sinnoh',title:'A champion’s resolve',color:'#d8c498',passive:'Pokémon costing 3 or more gain 10% HP.',power:'Select an ally. It gains 40% HP and 25 Defense next battle.'},
  may:{name:'May',region:'Hoenn',title:'Follow the starlight',color:'#94ded4',passive:'Cosmic reward rounds grant 2 extra gold.',power:'Gain 3 gold and a free shop refresh. Once per charge cycle.'},
  n:{name:'N',region:'Unova',title:'A bond beyond words',color:'#a8d496',passive:'Survivors gain 3% HP per consecutive survived round, up to 15%.',power:'Your team begins the next battle with a 150 HP shield.'}
};
export const unitName = (familyId:string,star=1) => FAMILIES[familyId].names[star-1];
export const sprite = (familyId:string,star=1) => `/sprites/${FAMILIES[familyId].dex[star-1]}.png`;
