# Sécurisation Firebase V6 : version de travail

**Ne pas publier ces nouvelles règles pour le moment.** La V6 existante ne transmet pas encore le champ `createdAtMs` et les 78 prix canoniques ne sont pas initialisés.

## Confirmation du test n°5
L'administrateur peut actuellement écrire dans `/shared/test_ecriture` car les règles actives donnent une permission d'écriture au dossier parent. Ce comportement est connu et doit être corrigé.

## Modifications proposées
- Supprimer le droit global en écriture sur `shared`.
- Autoriser les écritures uniquement dans les collections nécessaires et selon le rôle.
- Interdire les nouveaux champs non prévus (`$other`).
- Rendre les ventes et inventaires append-only (une écriture, pas d'écrasement).
- Vérifier chaque prix de vente par rapport au tarif de référence enregistré dans Firebase.
- Exiger un horodatage serveur `createdAtMs` validé par `now`.
- Restreindre les identifiants aux 78 produits et aux 74 références de stock.

## Préalables avant publication
1. Faire valider les 78 tarifs du fichier `catalogue-prix-a-verifier.json` par l'établissement.
2. Initialiser `/shared/prices` sans écraser les prix existants.
3. Adapter la V6 pour écrire `createdAtMs` avec `serverTimestamp()`.
4. Exécuter des tests complets avec un émulateur Firebase ET le simulateur de règles, notamment les écritures groupées `update()`.
5. Vérifier l'export et la restauration des sauvegardes.
6. Ne publier qu'après tests concluants. La V6 en ligne et les règles actives restent actuellement inchangées.

La forme des dates `YYYY-MM-DD` est contrôlée, mais elle ne remplace pas une vraie validation calendaire et métier. Le risque de rétrodatation doit être géré explicitement au niveau du workflow.
