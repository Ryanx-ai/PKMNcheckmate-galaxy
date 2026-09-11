export function next(seed: number): [number, number] { const s=(Math.imul(seed,1664525)+1013904223)>>>0; return [s,s/4294967296]; }
export function random(seed:number) { let s=seed; return ()=>{const pair=next(s);s=pair[0];return pair[1];}; }
