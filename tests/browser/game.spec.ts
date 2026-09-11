import { test, expect } from '@playwright/test';

test('practice: buy, swap, equip, XP, lock, combat, rewards and device recovery',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.getByRole('button',{name:'Close Your next adventure is written in the stars.'}).click();
 await page.getByRole('button',{name:'Buy Pichu for 1 gold',exact:true}).click();await expect(page.getByRole('button',{name:'Select bench Pichu, 1 stars',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Select bench Pichu, 1 stars',exact:true}).click();await page.getByRole('button',{name:'Select Squirtle, 1 stars',exact:true}).click();
 await expect(page.getByRole('button',{name:'Select bench Squirtle, 1 stars',exact:true})).toBeVisible();await page.getByRole('button',{name:'Muscle Band',exact:true}).click();
 await page.getByRole('button',{name:'Row 6, column 1',exact:true}).click();await expect(page.getByRole('button',{name:'Row 6, column 1, Pichu',exact:true})).toBeAttached();
 await page.getByRole('button',{name:'Select bench Squirtle, 1 stars',exact:true}).click();await page.getByRole('button',{name:/Sell Pokémon/}).click();
 await page.getByRole('button',{name:'Buy XP 4',exact:true}).click();await page.getByRole('button',{name:'Buy XP 4',exact:true}).click();
 await page.getByRole('button',{name:'Lock shop',exact:true}).click();
 const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('checkmate.galaxy.v1')!));expect(state.level).toBe(4);expect(state.units.find((u:any)=>u.family==='pichu').item).toBe('muscle');
 for(let round=1;round<=3;round++){await page.getByRole('button',{name:'Enter the rift',exact:true}).click();if(round===1)await page.getByRole('button',{name:'Battle speed 2x'}).click();await expect(page.getByRole('button',{name:'Continue',exact:true})).toBeVisible({timeout:20000});await page.getByRole('button',{name:'Continue',exact:true}).click();if(round===1){const next=await page.evaluate(()=>JSON.parse(localStorage.getItem('checkmate.galaxy.v1')!));expect(next.shop).toEqual(state.shop);}}
 await expect(page.getByRole('dialog',{name:'The cosmos has something for you.'})).toBeVisible();await page.locator('.reward-card').first().click();const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('checkmate.galaxy.v1')!));expect(after.round).toBe(4);expect(after.history.length).toBe(3);await page.reload();const restored=await page.evaluate(()=>JSON.parse(localStorage.getItem('checkmate.galaxy.v1')!));expect(restored.gold).toBe(after.gold);expect(restored.round).toBe(4);
 await page.getByRole('button',{name:'Pokédex',exact:true}).click();await page.getByLabel('Find a partner').pressSequentially('garchomp');await expect(page.getByLabel('Find a partner')).toHaveValue('garchomp');await expect(page.locator('.dex-card')).toHaveCount(1);await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
 await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);await page.screenshot({path:'test-results/practice-desktop.png',fullPage:true});
});
test('mobile: trainer selection, readable board, touch purchase, no horizontal overflow',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');await page.getByRole('button',{name:/C Cynthia Sinnoh/}).click();await page.getByRole('button',{name:'Enter the galaxy',exact:true}).click();await expect(page.getByRole('heading',{name:'Cynthia',exact:true})).toBeVisible();await page.locator('.buy-card').first().click();await expect(page.locator('.bench-slot .sprite')).toHaveCount(1);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();expect(await page.locator('.bench-slot').first().evaluate(el=>el.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);await page.screenshot({path:'test-results/practice-mobile.png',fullPage:true});
});
