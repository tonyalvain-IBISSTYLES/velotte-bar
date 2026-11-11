import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import vm from 'node:vm';

(async function v61Smoke(){
 const html=readFileSync('v61/index.html','utf8'),ux=readFileSync('v61/ux.js','utf8'),css=readFileSync('v61/ux.css','utf8');
 assert(html.includes('<script src="./ux.js"></script>')&&html.includes('href="./ux.css"'));
 assert(html.includes('window.VelotteUX?.accountSwitch?.(user?.uid)'));
 assert(html.includes("get(ref(db,'shared/sales/'+row.id))"),'relecture idempotente absente');
 assert(css.includes('ux-submitting'));
 const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
 assert(scripts.length>=2);
 const dir=mkdtempSync(join(tmpdir(),'velotte-ux-'));
 try{
  writeFileSync(join(dir,'main.js'),scripts[0][1]);
  writeFileSync(join(dir,'firebase.mjs'),scripts[1][1]);
  execFileSync(process.execPath,['--check',join(dir,'main.js')],{stdio:'pipe'});
  execFileSync(process.execPath,['--check',join(dir,'firebase.mjs')],{stdio:'pipe'});
  execFileSync(process.execPath,['--check','v61/ux.js'],{stdio:'pipe'});
 }finally{rmSync(dir,{recursive:true,force:true})}
 const p1={id:'p001',name:'Coca-Cola sans sucre',format:'33 cl',code:2701,price:2.5,group:'Soft',stockKey:'coca',stockUnit:'unité'};
 const p2={id:'p002',name:'Heineken pression',format:'25 cl',code:2702,price:4,group:'Alcool',keg:true,stockKey:'Heineken pression',stockUnit:'litre'};
 const products=[p1,p2],screen={innerHTML:''},actions={},buttons=[];
 const ctx={
  PRODUCTS:products,PRODUCT_BY_ID:{p001:p1,p002:p2},STOCK_KEYS:[{key:'coca',unit:'unité',name:'Coca-Cola sans sucre'}],
  KNOWN_KEYS:new Set(['coca']),state:{sales:[]},cart:{},invDraft:{},fromDraft:{},page:'ventes',saleFilter:'Tous',saleQuery:'zero',invDate:'2026-11-11',saleDate:'2026-11-11',
  today:()=> '2026-11-11',h:x=>String(x),eur:n=>`${n} €`,priced:p=>p.price,productEmoji:()=> '🥤',
  typeMatches:()=>true,saleSection:p=>p.group==='Soft'?'Softs':'Pression',saleSectionMeta:()=>({icon:'🥤',desc:'Boissons'}),
  productRowHTML:p=>`<article>${p.name}</article>`,salesOverviewHTML:()=>'',kegShowcaseHTML:()=>'',validCount:(k,n)=>Number.isFinite(n)&&n>=0,stockInfo:()=>({remaining:4,meta:{unit:'unité'}}),
  nfmt:n=>String(n),saleTotal:s=>s.qty*s.price,validateDate:()=>true,validQty:n=>Number.isInteger(Number(n))&&Number(n)>0,uid:(()=>{let i=0;return ()=>`id_unique_${++i}`})(),
  toStamp:()=> '2026-11-11T10:00:00Z',saveDraft:()=>{},toast:()=>{},cloudSubmitting:false,
  sales:()=>'<div>base</div>',inventory:()=>'<div class="field" style="margin-top:17px"><label for="inventory-note">',home:()=>'<div>home</div>',
  guide:()=>'<div>guide</div>',reports:()=>'<div>reports</div>',productsHTML:()=>'<div>old</div>',render:()=>{},checkout:()=>{},currentDraft:()=>({}),
  cloudCall:async (_action,lines,success)=>{ctx.calls.push(lines.map(x=>({...x})));if(ctx.ack)success?.()},
  calls:[],ack:false,buttonTo:()=>{},setTitle:()=>{},
  window:{VelotteV6:{applyRemote(){}},VelotteCloud:{role:()=>ctx.role}},
  role:'reception',
  document:{body:{dataset:{},classList:{add(){},remove(){}}},getElementById:()=>screen,querySelectorAll:()=>buttons,addEventListener:(name,fn)=>{(actions[name]??=[]).push(fn)}},
  csvExport:()=>{},navigator:{},localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}}
 };
 vm.runInNewContext(ux,ctx,{timeout:2500});
 assert(html.includes("meta.unit==='bouteille'") && html.includes("x.unit==='litre'||x.unit==='bouteille'"),'gestion bouteille entamée absente dans V6.1');
 ctx.STOCK_KEYS.push({key:'martini',unit:'bouteille',name:'Martini Rouge'});
 assert.equal(ctx.validCount('martini',1.4),true,'1,4 bouteille doit être accepté');
 assert.equal(ctx.validCount('martini',0.5),true,'une demi-bouteille doit être acceptée');
 assert.equal(ctx.validCount('martini',0.25),true,'un quart de bouteille doit être accepté');
 assert.equal(ctx.validCount('martini',0.333),false,'au-delà de 2 décimales, refuser');
 assert.equal(ctx.validCount('martini',-0.5),false,'stock négatif interdit');
 assert.equal(ctx.validCount('coca',1.4),false,'les unités restent entières');

 assert(ctx.productsHTML().includes('Coca-Cola sans sucre'),'alias zéro non reconnu');
 ctx.saleQuery='';assert(ctx.productsHTML().includes('Vente express'),'favoris non affichés');
 ctx.invDraft.coca='1';assert(ctx.inventory().includes('Contrôle avant validation'));
 ctx.page='rapports';ctx.render();assert.equal(ctx.page,'accueil','accès réception incorrect');
 ctx.role='responsable';ctx.page='rapports';ctx.render();assert(ctx.reports().includes('Rapprochement quotidien avec OPERA'));
 ctx.page='ventes';ctx.cart.p001=1;
 await ctx.checkout();await ctx.checkout();
 assert.equal(ctx.calls.length,2);assert.equal(ctx.calls[0][0].id,ctx.calls[1][0].id,'une vente incertaine doit garder le même ID');
 console.log('V6.1 : syntaxe HTML/JS + contrôles UX, bouteille fractionnaire, saisie et rôles (Firebase simulé)');
})().catch(err=>{console.error(err);process.exit(1)});
