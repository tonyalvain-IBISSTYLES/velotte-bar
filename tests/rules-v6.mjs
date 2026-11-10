import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';

const UID = 'WyMkt1Cvv7eJFFETAtCJ1NH8CfC3';
const projectId='demo-velotte-v6-security';
const rules=readFileSync('firebase.rules.v6.hardening-draft.json','utf8');
const env=await initializeTestEnvironment({projectId,database:{host:'127.0.0.1',port:9000,rules}});
const admin=env.authenticatedContext(UID).database();
const manager=env.authenticatedContext('TEST_MANAGER').database();
const reception=env.authenticatedContext('TEST_RECEPTION').database();
const outsider=env.authenticatedContext('TEST_UNKNOWN').database();
const guest=env.unauthenticatedContext().database();

let total=0,passed=0;
async function expect(name,promise,shouldAllow=true) {
 total++;
 try{
   if(shouldAllow)await assertSucceeds(promise);
   else await assertFails(promise);
   passed++;
   console.log('PASS',String(total).padStart(2,'0'),name);
 }catch(error){
   console.error('FAIL',String(total).padStart(2,'0'),name, error?.message||error);
   throw error;
 }
}
const seedPrices={};
for(let i=1;i<=78;i++)seedPrices['p'+String(i).padStart(3,'0')]=3.4;
for(const [h,p,v] of [['p033','p036',3.7],['p034','p037',4],['p035','p038',7.4]]){seedPrices[h]=v;seedPrices[p]=v;}
const ts={'.sv':'timestamp'};
const date='2026-11-10',createdAt='2026-11-10T20:25:00.000Z';
function id(s){return 'id_test_'+s}
function sale(s,{price=3.4,qty=1,createdAtMs=ts,productId='p005',by_uid='TEST_RECEPTION',batch=id('batch_01'),extra={}}={}){
 return {id:id(s),batch,date,productId,qty,price,createdAt,createdAtMs,by_uid,...extra};
}
function inventory(s,items,extra={}){return {id:id(s),date,createdAt,createdAtMs:ts,items,by_uid:'TEST_RECEPTION',note:'Comptage',...extra};}

try{
 await env.withSecurityRulesDisabled(async ctx=>{
   await ctx.database().ref('/').set({
      roles:{[UID]:'admin',TEST_MANAGER:'responsable',TEST_RECEPTION:'reception'},
      shared:{prices:seedPrices}
   });
 });
 await expect('Anonyme ne peut pas lire /shared',guest.ref('/shared').get(),false);
 await expect('UID sans role ne peut pas lire /shared',outsider.ref('/shared').get(),false);
 await expect('Administrateur lit /shared',admin.ref('/shared').get());
 await expect('Réception lit /shared',reception.ref('/shared').get());
 await expect('UID inconnu ne peut pas écrire',outsider.ref('/shared/thresholds/s005').set(5),false);
 await expect('Chemin inconnu interdit à admin',admin.ref('/shared/test_ecriture').set({test:true}),false);
 await expect('Admin modifie seuil',admin.ref('/shared/thresholds/s005').set(5));
 await expect('Réception ne modifie pas seuil',reception.ref('/shared/thresholds/s005').set(6),false);
 await expect('Responsable modifie seuil',manager.ref('/shared/thresholds/s005').set(6));
 await expect('Seuil négatif refusé',admin.ref('/shared/thresholds/s005').set(-5),false);
 await expect('Seuil fractionnaire (unité) refusé',admin.ref('/shared/thresholds/s005').set(2.5),false);
 await expect('Seuil fractionnaire litre autorisé',admin.ref('/shared/thresholds/s032').set(2.5));
 await expect('Prix valide administrateur',admin.ref('/shared/prices/p005').set(3.55));
 seedPrices.p005=3.55;
 await expect('Réception ne modifie pas prix',reception.ref('/shared/prices/p005').set(4),false);
 await expect('Produit inexistant refusé',admin.ref('/shared/prices/p999').set(4),false);
 await expect('Suppression tarif interdite',admin.ref('/shared/prices/p005').remove(),false);
 await expect('Modification Heineken seule refusée',admin.ref('/shared/prices/p033').set(4.1),false);
 await expect('Modification Heineken Pelican par paire',admin.ref('/shared/prices').update({p033:4.1,p036:4.1}));
 await expect('Vente réception avec timestamp serveur',reception.ref('/shared/sales/'+id('sale01')).set(sale('sale01',{price:3.55})));
 const saved=await reception.ref('/shared/sales/'+id('sale01')).get();
 assert.equal(typeof saved.val().createdAtMs,'number');
 await expect('Modification vente déjà validée interdite',reception.ref('/shared/sales/'+id('sale01')).update({qty:999}),false);
 await expect('Suppression vente déjà validée interdite',reception.ref('/shared/sales/'+id('sale01')).remove(),false);
 await expect('Vente à prix falsifié refusée',reception.ref('/shared/sales/'+id('sale02')).set(sale('sale02',{price:999})),false);
 await expect('Horodatage falsifié refusé',reception.ref('/shared/sales/'+id('sale03')).set(sale('sale03',{createdAtMs:1670000000000,price:3.55})),false);
 await expect('Champ imprévu dans vente refusé',reception.ref('/shared/sales/'+id('sale04')).set(sale('sale04',{price:3.55,extra:{bonus:true}})),false);
 await expect('Quantité décimale de vente refusée',reception.ref('/shared/sales/'+id('sale05')).set(sale('sale05',{price:3.55,qty:1.5})),false);
 await expect('Produit p999 en vente refusé',reception.ref('/shared/sales/'+id('sale06')).set(sale('sale06',{price:3.55,productId:'p999'})),false);
 await expect('Usurpation UID en vente refusée',reception.ref('/shared/sales/'+id('sale07')).set(sale('sale07',{price:3.55,by_uid:UID})),false);
 await expect('2 ventes groupées update',reception.ref('/shared/sales').update({
   [id('sale08')]:sale('sale08',{price:3.55}),
   [id('sale09')]:sale('sale09',{price:4.1,productId:'p033'})
 }));
 await expect('Inventaire réel: unités et litres',reception.ref('/shared/inventories/'+id('inv01')).set(inventory('inv01',{s005:8,s032:7.5})));
 await expect('Inventaire fractionnaire unité refusé',reception.ref('/shared/inventories/'+id('inv02')).set(inventory('inv02',{s005:1.5})),false);
 await expect('Inventaire à champ inconnu refusé',reception.ref('/shared/inventories/'+id('inv03')).set(inventory('inv03',{s005:8},{secret:'x'})),false);
 await expect('Réception ne peut pas réécrire inventaire',reception.ref('/shared/inventories/'+id('inv01')).update({note:'retouché'}),false);
 const movement={id:id('mov01'),stockId:'s032',qty:8,reason:'Livraison',date,createdAt,createdAtMs:ts,by_uid:'TEST_MANAGER'};
 await expect('Réception ne modifie pas les mouvements',reception.ref('/shared/movements/'+id('mov02')).set({...movement,id:id('mov02'),by_uid:'TEST_RECEPTION'}),false);
 await expect('Responsable crée mouvement',manager.ref('/shared/movements/'+id('mov01')).set(movement));
 await expect('Mouvement unité fractionnaire refusé',manager.ref('/shared/movements/'+id('mov03')).set({...movement,id:id('mov03'),stockId:'s005',qty:1.5}),false);
 const cancelled={by_uid:'TEST_MANAGER',createdAt,createdAtMs:ts,reason:'Erreur de saisie'};
 await expect('Réception ne peut pas annuler lot',reception.ref('/shared/cancelledBatches/'+id('batch_01')).set({...cancelled,by_uid:'TEST_RECEPTION'}),false);
 await expect('Responsable annule lot',manager.ref('/shared/cancelledBatches/'+id('batch_01')).set(cancelled));
 await expect('Annulation déjà actée immuable',manager.ref('/shared/cancelledBatches/'+id('batch_01')).remove(),false);
 await expect('Administration des rôles réservée admin',reception.ref('/roles/TEST_UNKNOWN').set('reception'),false);
 await expect('Admin ne peut donner un deuxième rôle admin',admin.ref('/roles/TEST_UNKNOWN').set('admin'),false);
 await expect('Admin peut donner un rôle réception',admin.ref('/roles/TEST_UNKNOWN').set('reception'));
 await expect('Utilisateur autorisé lit après attribution',outsider.ref('/shared').get());
 // Sauvegarde et restauration DANS L'ÉMULATEUR uniquement : aucune donnée de l'hôtel.
 const sharedBefore=(await admin.ref('/shared').get()).val();
 const archive=JSON.stringify({
   format:'velotte-v6-complete',
   project:'demo-velotte-v6-security',
   exportedAt:new Date().toISOString(),
   shared:sharedBefore
 });
 const readArchive=JSON.parse(archive);
 assert.equal(readArchive.format,'velotte-v6-complete');
 assert.equal(Object.keys(readArchive.shared.prices).length,78);
 await expect('Sauvegarde JSON complète et lisible',Promise.resolve(readArchive));
 await env.withSecurityRulesDisabled(async ctx=>{
   const db=ctx.database();
   await db.ref('/recovery_sandbox').set({placeholder:'données à restaurer'});
   await db.ref('/recovery_sandbox').remove();
   await db.ref('/recovery_sandbox').set(readArchive.shared);
 });
 let recovered;
 await env.withSecurityRulesDisabled(async ctx=>{
   recovered=(await ctx.database().ref('/recovery_sandbox').get()).val();
 });
 assert.deepEqual(recovered,sharedBefore,'La restauration isolée doit restituer exactement les données sauvegardées.');
 await expect('Restauration de sauvegarde validée en environnement isolé',Promise.resolve(recovered));
 await env.withSecurityRulesDisabled(async ctx=>ctx.database().ref('/recovery_sandbox').remove());
 console.log('SUCCÈS',passed,'/',total,'tests Firebase officiels.');
}catch(e){process.exitCode=1;console.error('ÉCHEC:',e?.stack||e);}finally{await env.cleanup();}
