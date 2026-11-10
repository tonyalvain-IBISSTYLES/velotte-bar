# Velotte Bar V6 — Bilan des contrôles regroupés

**Date : 10 novembre 2026**

**Statut : BÊTA SUR BRANCHE D'AUDIT — NON PRÊT À PUBLIER LES RÈGLES.**

## Vérifications Firebase réalisées par l'administrateur (simulateur de la console)

L'utilisateur a confirmé les résultats :
1. GET /shared anonyme : refusé avec les règles initiales.
2. GET /shared administrateur : autorisé.
3. GET /shared utilisateur connecté sans rôle : refusé.
4. SET /shared/test_ecriture utilisateur sans rôle : refusé.
5. SET /shared/test_ecriture administrateur et anciennes règles : autorisé, révélant le droit parent trop large.
6. SET /shared/test_ecriture administrateur et projet de nouvelles règles dans l'éditeur : refusé.
7. UPDATE /shared/thresholds {"s005":5} : autorisé avec nouvelles règles.
8. UPDATE /shared/thresholds {"s005":-5} : refusé.
9. UPDATE /shared/prices {"p005":3.4} : autorisé.
10. UPDATE /shared/prices {"p999":3.4} : refusé.

**Ne pas confondre simulations et transactions effectives.** Les règles de production ne doivent pas être publiées tant que le déploiement complet n'a pas été testé.

## 28 vérifications automatisées locales sur la dernière branche d'audit

- **18/18** : prix Pelican initialisés de manière cohérente, conservation des tarifs existants, écriture des horodatages sur les ventes/inventaires/mouvements/annulations, contraintes d'unité de stock, refus tarif nul, restrictions de règles, scripts syntaxiquement valides.
- **5/5** : fût Heineken 8 L -> 7,5 L après deux ventes 25 cl, 0 L après 32 ventes 25 cl, vente antérieure à l'inventaire ignorée, livraison de +8 L correctement comptée, fût Pelican suivi séparément.
- **5/5** : modification ciblée d'un prix, modification Heineken alignée automatiquement sur Pelican, blocage de modification Pelican seule, refus d'un tarif vide, remise à zéro des modifications après confirmation simulée.

**Limite :** les tests utilisent des simulations JS isolées et une revue statique. Aucun émulateur officiel Firebase n'a été exécuté, aucune écriture n'a été effectuée dans la base réelle durant cette phase.

## Corrections conservées sur audit-v6-fiabilisation

1. Fichier `beta/index.html` : horodatage `createdAtMs` via `serverTimestamp()`, prix de référence initiaux 78/78, initialisation non destructive, interface d'édition de prix réservée à l'admin, Pelican dérivé de Heineken, sauvegarde des ventes append-only et ordre chronologique.
2. Fichier `firebase.rules.v6.hardening-draft.json` : interdiction d'écritures sur chemins non prévus ; rôle, prix canonique, horodatage, champs et identifiants validés ; seuls deux stocks de fûts s032/s033 permettent des quantités décimales ; les 72 autres exigent des entiers.
3. Ces fichiers sont **NON PUBLIÉS** dans Firebase et **NON FUSIONNÉS** à `main`.

## Points bloquants avant mise en production

1. **Validation avec le moteur Firebase officiel** : tests des écritures groupées `update()` de ventes, des timestamps serveur, des prix et des rôles, avec un environnement isolé. Les dix simulations manuelles seules ne suffisent pas.
2. **Catalogue** : vérifier les 78 tarifs d'après la carte réellement pratiquée. Ne pas initialiser des tarifs non validés.
3. **Séquence de déploiement** : déployer d'abord le code client corrigé sur un environnement de test, créer les prix de référence sans écraser les existants, puis seulement activer les règles renforcées après essais.
4. **Sauvegarde et reprise** : exporter une sauvegarde complète et en tester la restauration dans une base d'essai distincte. La V6 ne propose pas encore la restauration cloud.
5. **Essais collaboratifs réels** : deux appareils (réception/responsable), vente et inventaire simultanés, annulation, réseau coupé, reconnexion et révocation d'accès.
6. **Contrôle de coûts Spark** : suivre les quotas Firebase, car la lecture du dossier `/shared` resynchronise actuellement toutes les données.

## Précautions

- Ne pas cliquer sur « Publier » dans Firebase pour ce brouillon.
- Les règles copiées précédemment dans l'éditeur de Firebase **ne sont pas la toute dernière version** ; pour les tests futurs, recopier le fichier actuel du dépôt.
- Le projet actif, le site GitHub Pages et les données réelles ne sont pas touchés par cette phase.
- Le projet est prometteur mais ne peut pas encore être présenté comme totalement sécurisé ou prêt pour l'ensemble de l'équipe.


## Mise à jour après les contrôles regroupés

- **44/44 tests officiels Firebase Emulator réussis** dans GitHub Actions, y compris une sauvegarde JSON et sa restauration intégrale dans un dossier isolé de l'émulateur.
- L'application V6 bêta corrigée et le fichier `firebase.rules.v6.json` ont été transférés sur `main` le 10 novembre 2026.
- Ces commits GitHub **ne publient pas les règles dans Firebase Console** et ne modifient pas les données en production.
- Il reste à effectuer la sauvegarde réelle, valider le catalogue, initialiser les tarifs et publier les règles avec intervention de l'administrateur.
