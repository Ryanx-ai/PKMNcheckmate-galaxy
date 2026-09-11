import { mkdir, writeFile } from 'node:fs/promises';
import { ROSTER } from '../src/game/data';
const base='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
const ids=[...new Set(ROSTER.flatMap(f=>f.dex))];await mkdir('public/sprites',{recursive:true});
let failures=0;
for(let start=0;start<ids.length;start+=8)await Promise.all(ids.slice(start,start+8).map(async id=>{
 const response=await fetch(`${base}/${id}.png`);if(!response.ok){console.error(`Missing sprite ${id}: ${response.status}`);failures++;return;}
 const bytes=Buffer.from(await response.arrayBuffer());if(bytes.subarray(1,4).toString()!=='PNG')throw Error(`Invalid PNG ${id}`);await writeFile(`public/sprites/${id}.png`,bytes);
}));
console.log(`Sprites: ${ids.length-failures}/${ids.length} saved.`);if(failures)process.exitCode=1;
