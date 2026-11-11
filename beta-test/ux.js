'use strict';
(function VelotteV61Experience(){
'use strict';
// Surcouche ergonomique non destructive : aucune nouvelle collection Firebase.
const normalize = x=>String(x??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,' ').replace(/[-–—]/g,' ').replace(/\s+/g,' ').trim();
const productMatch=(p,query)=>{
 const q=normalize(query);if(!q)return true;
 const name=normalize(`${p.name} ${p.format||''} ${p.code||''}`);
 if(name.includes(q))return true;
 const synonyms=[
  [/\bzero\b|\b0\s*sucre\b|\bsans\s*sucre\b/,/coca.*(?:sans sucre|zero|zéro)/i],
  [/\bsoda\b/,/coca|orangina|fanta|sprite|limonade|schweppes|7up/i],
  [/\bbierre\b|\bbiere\b/,/heineken|pelican|p[eé]lican|1664|desperados/i],
  [/\bcafe\b/,/caf[eé]|d[eé]caf[eé]in[eé]/i],
  [/\bjus\b/,/granini|jus|oasis/i],
  [/\beau\b/,/vittel|perrier|san pellegrino|eau/i],
  [/\bthe\b/,/th[eé]|infusion/i]
 ];
 return synonyms.some(([qRx,nameRx])=>qRx.test(q)&&nameRx.test(p.name));
};
const topProducts=()=>{
 const boundary=new Date();boundary.setDate(boundary.getDate()-30);
 const counts=new Map();
 for(const sale of state.sales){
  if(!sale.date||new Date(sale.date+'T12:00:00')<boundary)continue;
  counts.set(sale.productId,(counts.get(sale.productId)||0)+Number(sale.qty||0));
 }
 const hot=[...counts].sort((a,b)=>b[1]-a[1]).map(([id])=>PRODUCT_BY_ID[id]).filter(Boolean);
 const starters=PRODUCTS.filter(p=>/coca|heineken|vittel|perrier|caf[eé]|pelican|p[eé]lican/i.test(p.name));
 return [...new Map([...hot,...starters,...PRODUCTS].map(p=>[p.id,p])).values()].slice(0,8);
};
const quickHTML=()=>`<section class="ux-fast" aria-label="Vente express"><div class="ux-fast-top"><div><h2>⚡ Vente express</h2><p>Les références les plus utilisées en premier. Un clic ajoute au panier, sans valider la vente.</p></div><small>8 raccourcis</small></div><div class="ux-fast-grid">${topProducts().map(p=>`<button type="button" class="ux-fast-item" data-ux-add="${h(p.id)}" aria-label="Ajouter ${h(p.name)} au panier"><span class="ux-fast-icon">${productEmoji(p)}</span><span class="ux-fast-name">${h(p.name)}</span><span class="ux-fast-bottom"><b>${priced(p)==null?'Prix à vérifier':eur(priced(p))}</b><span>+1</span></span></button>`).join('')}</div></section>`;
productsHTML=function(){
 const out=PRODUCTS.filter(p=>typeMatches(p,saleFilter)&&productMatch(p,saleQuery));
 const quick=(!saleQuery&&saleFilter==='Tous')?quickHTML():'';
 if(!out.length)return `<div class="empty"><div class="eicon">🔎</div><h3>Aucune boisson trouvée</h3><p>Essayez « zéro », « café », « soda » ou une autre catégorie.</p></div>`;
 const sections=['Pression','Softs','Chaudes','Alcools'].map(section=>({section,items:out.filter(p=>saleSection(p)===section)})).filter(x=>x.items.length);
 return `<div class="sales-shell">${quick}${salesOverviewHTML(out)}${kegShowcaseHTML(true)}<div class="product-groups">${sections.map(g=>{const m=saleSectionMeta(g.section);return `<section class="product-section"><div class="section-strip"><div><h3>${m.icon} ${h(g.section)}</h3><p>${h(m.desc)}</p></div><span class="count">${g.items.length} produit(s)</span></div><div class="product-list">${g.items.map(productRowHTML).join('')}</div></section>`}).join('')}</div></div>`;
};
const originalSales=sales;
sales=function(){
 const html=originalSales();
 setTitle('Vente express 🥤','Retrouvez la boisson, ajustez la quantité, puis confirmez une seule fois.');
 return `<div class="ux-banner" role="note"><strong>V6.1 — Parcours réception :</strong> enregistrez d’abord l’encaissement dans OPERA (2701 softs / 2702 alcools), puis la référence exacte dans Velotte Bar. Seule la confirmation Firebase valide la saisie.</div>`+html.replace('placeholder="Ex : Coca, Vittel, Heineken…"','placeholder="Nom, alias (zéro, soda, café…), code 2701 ou 2702"').replace('Aucune vente encore enregistrée sur cet appareil.','Aucune vente encore enregistrée dans les données partagées.');
};
function inventoryPreviewHTML(){
 const entered=Object.entries(invDraft).filter(([key,value])=>KNOWN_KEYS.has(key)&&value!==''&&value!=null&&validCount(key,stockNumber(value)));
 if(!entered.length)return '<p class="ux-muted">Aucune quantité renseignée. Saisissez 0 pour un produit réellement épuisé, laissez vide s’il n’est pas compté.</p>';
 const lines=entered.map(([key,raw])=>{
  const found=stockInfo(key),current=stockNumber(raw),previous=found.remaining;
  const gap=previous==null?null:Math.round((current-previous)*100)/100;
  return {name:key,unit:found.meta.unit,qty:current,expected:previous,gap};
 });
 const differences=lines.filter(x=>x.gap!==null&&Math.abs(x.gap)>0.0001);
 return `<div class="ux-inv-summary"><strong>${lines.length} référence(s) comptée(s) · ${differences.length} écart(s) à vérifier</strong><p>Comparaison indicative avec le stock théorique actuellement connu. Un écart n’est pas automatiquement une perte ou un vol.</p>${invDate!==today()?'<p class="ux-caution">⚠ Inventaire antidaté : la comparaison ci-dessous n’est pas une reconstitution historique.</p>':''}<div class="ux-inv-list">${differences.slice(0,15).map(x=>`<div><span>${h(x.name)} <small>(${h(x.unit)})</small></span><b>${x.gap>0?'+':''}${nfmt(x.gap,2)}</b></div>`).join('')}${differences.length>15?`<small>Et ${differences.length-15} autre(s) écart(s).</small>`:''}${!differences.length?'<small>Pas d’écart visible sur les références déjà comptées.</small>':''}</div></div>`;
}
const originalInventory=inventory;
inventory=function(){
 const raw=originalInventory();
 const target='<div class="field" style="margin-top:17px"><label for="inventory-note">';
 return raw.replace(target,`<div class="ux-preview" id="ux-inventory-preview" aria-live="polite"><h3>Contrôle avant validation</h3>${inventoryPreviewHTML()}</div>${target}`);
};
const originalHome=home;
home=function(){
 let raw=originalHome();
 const notice='<div class="notice" style="margin-top:18px"><span>🔐</span>';
 const start=raw.indexOf(notice);if(start>=0)raw=raw.slice(0,start)+`<div class="ux-banner">🔐 <b>Version collaborative V6.1 en évaluation.</b> Les données affichées proviennent de Firebase après connexion. Cette branche V6.1 est reliée au projet Firebase TEST indépendant. Ne publiez pas de changement sur le projet de production avant validation des règles, des essais et d’une sauvegarde.</div>`;
 return raw;
};
const originalGuide=guide;
guide=function(){
 return originalGuide().replace('Les 4 réflexes à adopter','Les réflexes à adopter')+`<div class="ux-banner" style="margin-top:16px"><strong>En cas de coupure réseau :</strong> ne supposez jamais qu’une vente est enregistrée. Conservez le panier et vérifiez les derniers enregistrements avant de réessayer. Ne transmettez jamais les mots de passe entre collègues.</div>`;
};
let comparisonDate=today(),comparisonSoft='',comparisonAlc='';
function numFrench(raw){if(String(raw).trim()==='')return null;const value=Number(String(raw).trim().replace(/\s/g,'').replace(',','.'));return Number.isFinite(value)&&value>=0?value:NaN}
function compareHTML(){
 const rows=state.sales.filter(s=>s.date===comparisonDate);
 const calc=(code)=>rows.filter(s=>PRODUCT_BY_ID[s.productId]?.code===code).reduce((sum,s)=>sum+(saleTotal(s)||0),0);
 const appSoft=calc(2701),appAlc=calc(2702),operaSoft=numFrench(comparisonSoft),operaAlc=numFrench(comparisonAlc);
 const variance=(app,opera)=>opera===null?'Montant OPERA à renseigner':Number.isNaN(opera)?'Montant OPERA invalide':`${eur(Math.round((app-opera)*100)/100)} d’écart (Velotte − OPERA)`;
 return `<div class="ux-compare-grid"><div><span>2701 · Softs Velotte</span><strong>${eur(appSoft)}</strong><small>${h(variance(appSoft,operaSoft))}</small></div><div><span>2702 · Alcools Velotte</span><strong>${eur(appAlc)}</strong><small>${h(variance(appAlc,operaAlc))}</small></div></div><p class="ux-muted">Comparaison indicative : les recettes OPERA sont les données financières de référence. Les écarts peuvent venir de codes employés différemment, de saisies manquantes ou de prix différents. Aucun montant OPERA n’est envoyé à Firebase.</p>`;
}
const originalReports=reports;
reports=function(){
 const raw=originalReports().replace('Vos saisies locales deviennent des indicateurs lisibles.','Les saisies partagées deviennent des indicateurs lisibles.').replace('Chiffres issus des ventes enregistrées dans ce navigateur uniquement.','Chiffres issus des ventes synchronisées de Velotte Bar.');
 return raw+`<section class="panel ux-reconcile" style="margin-top:20px"><h3>🧾 Rapprochement quotidien avec OPERA</h3><p class="sub">Saisir les montants encaissés dans OPERA par code, puis comparer au total tarifé des ventes Velotte Bar. Cette comparaison reste locale et n’enregistre aucun montant OPERA.</p><div class="ux-reconcile-fields"><label>Date<input id="ux-compare-date" type="date" class="input" value="${h(comparisonDate)}" max="${today()}"></label><label>OPERA 2701 (€)<input id="ux-compare-soft" class="input" type="text" inputmode="decimal" placeholder="Ex. 35,50" value="${h(comparisonSoft)}"></label><label>OPERA 2702 (€)<input id="ux-compare-alc" class="input" type="text" inputmode="decimal" placeholder="Ex. 19,00" value="${h(comparisonAlc)}"></label></div><div id="ux-compare-result" aria-live="polite">${compareHTML()}</div><button class="btn soft" type="button" data-ux-export="compare">Exporter cette comparaison CSV</button></section>`;
};
let auditEvents=[];
const oldApplyRemote=window.VelotteV6.applyRemote;
window.VelotteV6.applyRemote=function(raw){
 const records=[];
 const valueEntries=(obj)=>Object.values(obj||{}).filter(x=>x&&typeof x==='object'&&!Array.isArray(x));
 const cancelled=new Set(Object.keys(raw?.cancelledBatches||{}));
 for(const x of valueEntries(raw?.sales))records.push({type:cancelled.has(x.batch)?'Vente annulée':'Vente',date:x.createdAt||x.date,stamp:Number(x.createdAtMs)||Date.parse(x.createdAt||'')||0,who:x.by_uid||'',detail:`${PRODUCT_BY_ID[x.productId]?.name||x.productId} · ${x.qty} unité(s)`});
 for(const x of valueEntries(raw?.inventories))records.push({type:'Inventaire',date:x.createdAt||x.date,stamp:Number(x.createdAtMs)||Date.parse(x.createdAt||'')||0,who:x.by_uid||'',detail:`${Object.keys(x.items||{}).length} référence(s) comptée(s)`});
 for(const x of valueEntries(raw?.movements))records.push({type:'Mouvement',date:x.createdAt||x.date,stamp:Number(x.createdAtMs)||Date.parse(x.createdAt||'')||0,who:x.by_uid||'',detail:`${x.reason||'Ajustement'} · ${x.qty||0}`});
 for(const x of valueEntries(raw?.cancelledBatches))records.push({type:'Annulation',date:x.createdAt||'',stamp:Number(x.createdAtMs)||Date.parse(x.createdAt||'')||0,who:x.by_uid||'',detail:String(x.reason||'Lot annulé')});
 auditEvents=records.sort((a,b)=>b.stamp-a.stamp).slice(0,250);
 oldApplyRemote(raw);
};
function journalHTML(){
 setTitle('Journal des opérations 🔎','Traçabilité des ventes, inventaires et ajustements par compte.');
 return `<div class="ux-banner">Historique des opérations partagées dans Firebase. Les comptes sont identifiés par leur UID abrégé, pas par un prénom supposé. Les opérations annulées restent visibles et sont exclues des totaux actifs.</div><section class="panel"><div class="actions"><button class="btn soft" data-ux-export="journal">Exporter le journal CSV</button></div><div class="table-wrap"><table class="list-table"><thead><tr><th>Date</th><th>Action</th><th>Compte</th><th>Détails</th></tr></thead><tbody>${auditEvents.slice(0,100).map(x=>`<tr><td>${h(x.date?new Date(x.date).toLocaleString('fr-FR'):'—')}</td><td>${h(x.type)}</td><td title="${h(x.who)}">${h(x.who?x.who.slice(0,8)+'…':'Non renseigné')}</td><td>${h(x.detail)}</td></tr>`).join('')||'<tr><td colspan="4">Aucune opération enregistrée.</td></tr>'}</tbody></table></div></section>`;
}
const originalCurrentDraft=currentDraft;
let uxPending=fromDraft?.uxPending&&typeof fromDraft.uxPending==='object'?fromDraft.uxPending:null;
currentDraft=function(){return {...originalCurrentDraft(),uxPending};};
const originalCheckout=checkout;
checkout=async function(){
 if(cloudSubmitting)return toast('Enregistrement déjà en cours. Une seule validation suffit.');
 const entries=Object.entries(cart).filter(([id,n])=>Number(n)>0).sort(([a],[b])=>a.localeCompare(b));
 if(!entries.length||!validateDate(saleDate)||!entries.every(([id,n])=>PRODUCT_BY_ID[id]&&validQty(n)))return originalCheckout();
 const signature=JSON.stringify([saleDate,entries.map(([id,n])=>[id,Number(n),priced(PRODUCT_BY_ID[id])])]);
 const expected=entries.map(([productId,qty])=>({productId,qty:Number(qty),price:priced(PRODUCT_BY_ID[productId])}));
 const reliable=uxPending&&uxPending.signature===signature&&Array.isArray(uxPending.lines)&&uxPending.lines.length===expected.length&&uxPending.lines.every((row,i)=>row&&row.productId===expected[i].productId&&row.qty===expected[i].qty&&row.price===expected[i].price&&/^id_[A-Za-z0-9_]+$/.test(row.id)&&/^id_[A-Za-z0-9_]+$/.test(row.batch));
 if(!reliable){
  const stamp=toStamp(),batch=uid();
  uxPending={signature,lines:entries.map(([productId,qty])=>({id:uid(),batch,date:saleDate,productId,qty:Number(qty),price:priced(PRODUCT_BY_ID[productId]),createdAt:stamp}))};
  saveDraft();
 }
 const buttons=[...document.querySelectorAll('[data-act="checkout"]')];
 document.body.classList.add('ux-submitting');
 buttons.forEach(b=>{b.disabled=true;b.textContent='Synchronisation…';});
 try{
  await cloudCall('writeSales',uxPending.lines,()=>{cart={};uxPending=null;saveDraft();});
 }finally{
  document.body.classList.remove('ux-submitting');
  document.querySelectorAll('[data-act="checkout"]').forEach(b=>{b.disabled=false;b.textContent='Enregistrer ✓';});
 }
};
const oldRender=render;
render=function(){
 const role=window.VelotteCloud?.role?.()||'none';
 document.body.dataset.uxRole=role;
 document.body.dataset.uxPage=page;
 if(role==='reception'&&['rapports','reglages','journal'].includes(page))page='accueil';
 if(role==='responsable'&&page==='reglages')page='accueil';
 document.body.dataset.uxPage=page;
 if(page==='journal'&&['admin','responsable'].includes(role)){
  document.getElementById('screen').innerHTML=journalHTML();
 }else oldRender();
 document.querySelectorAll('[data-nav]').forEach(b=>{
  const restricted=(role==='reception'&&['rapports','reglages','journal'].includes(b.dataset.nav))||(role==='responsable'&&b.dataset.nav==='reglages');
  b.hidden=restricted;b.classList.toggle('active',b.dataset.nav===page);
 });
};
document.addEventListener('click',e=>{
 const target=e.target.closest('button');if(!target)return;
 if(target.hasAttribute('data-ux-add')){
  const id=target.dataset.uxAdd;if(!PRODUCT_BY_ID[id])return;
  cart[id]=Math.min(9999,(Number(cart[id])||0)+1);saveDraft();renderSaleTiles();toast('Ajouté au panier : '+PRODUCT_BY_ID[id].name);return;
 }
 if(target.dataset.uxExport==='journal'){
  if(!['admin','responsable'].includes(window.VelotteCloud?.role?.()))return;
  csvExport('journal_velotte_'+today()+'.csv',[['Date','Action','UID','Détail'],...auditEvents.map(x=>[x.date,x.type,x.who,x.detail])]);return;
 }
 if(target.dataset.uxExport==='compare'){
  if(!['admin','responsable'].includes(window.VelotteCloud?.role?.()))return;
  const sales=state.sales.filter(s=>s.date===comparisonDate);
  const calc=code=>sales.filter(s=>PRODUCT_BY_ID[s.productId]?.code===code).reduce((a,s)=>a+(saleTotal(s)||0),0);
  const os=numFrench(comparisonSoft),oa=numFrench(comparisonAlc);
  if(Number.isNaN(os)||Number.isNaN(oa))return toast('Montants OPERA invalides.');
  csvExport('rapprochement_opera_'+comparisonDate+'.csv',[['Date','Code','Velotte tarifé (€)','OPERA saisi (€)','Écart Velotte moins OPERA (€)'],[comparisonDate,2701,calc(2701),os??'',os===null?'':Math.round((calc(2701)-os)*100)/100],[comparisonDate,2702,calc(2702),oa??'',oa===null?'':Math.round((calc(2702)-oa)*100)/100]]);return;
 }
});
document.addEventListener('input',e=>{
 const t=e.target;
 if(t.hasAttribute('data-invkey')){
  const preview=t.closest('td')?.querySelector('[data-ux-bottle-draft]');
  if(preview){const raw=String(t.value??'').trim(),num=stockNumber(raw);preview.innerHTML=raw!==''&&validCount(t.dataset.invkey,num)?bottleVisual(t.dataset.invkey,num,'draft'):'';}
  const el=document.getElementById('ux-inventory-preview');if(el)el.innerHTML=`<h3>Contrôle avant validation</h3>${inventoryPreviewHTML()}`;
 }
 if(['ux-compare-date','ux-compare-soft','ux-compare-alc'].includes(t.id)){
  if(t.id==='ux-compare-date')comparisonDate=t.value;
  if(t.id==='ux-compare-soft')comparisonSoft=t.value;
  if(t.id==='ux-compare-alc')comparisonAlc=t.value;
  const el=document.getElementById('ux-compare-result');if(el)el.innerHTML=compareHTML();
 }
});
window.VelotteUX={
 version:'6.1',refresh:()=>render(),
 accountSwitch(uid){
  // Un même compte conserve son brouillon à la réouverture; un changement de compte le détruit.
  const key='velotte_v61_last_uid';let former=null;
  try{former=localStorage.getItem(key)}catch(_){former=null}
  if(!uid||uid!==former){uxPending=null;window.VelotteV6?.clearRemote();}
  try{if(uid)localStorage.setItem(key,uid);else localStorage.removeItem(key)}catch(_){/* Stockage local inaccessible : aucune donnée partagée n'est écrite ici */}
 }
};
})();
