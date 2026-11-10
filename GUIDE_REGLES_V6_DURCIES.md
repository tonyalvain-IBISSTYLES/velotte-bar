# Velotte Bar V6 — sécurisation et compatibilité (audit en cours)

**Date : 10 novembre 2026 — NE PAS PUBLIER LES RÈGLES POUR L'INSTANT.**

## État confirmé

- Les cinq premiers tests manuels de l'utilisateur sur les anciennes règles sont conformes : anonyme refusé en lecture, administrateur autorisé en lecture, utilisateur sans rôle refusé en lecture et en écriture, administrateur autorisé à écrire une donnée arbitraire.
- Ce dernier point est un **défaut de sécurité du modèle actuel**.
- Le site actuellement accessible sur GitHub Pages (`main/beta/`) **n'a pas été modifié**.
- Les corrections se trouvent uniquement dans la branche `audit-v6-fiabilisation`.

## Modifications préparées sur la branche d'audit

1. Import de `serverTimestamp()` et ajout de `createdAtMs` à chaque vente, inventaire, mouvement et annulation.
2. Utilisation des horodatages serveur pour ordonner les opérations et calculer la consommation par rapport à l'inventaire.
3. Affichage d'un bouton **Initialiser les tarifs manquants** réservé à l'administrateur, sans écraser les prix déjà présents ; arrêt en cas de divergence Heineken/Pelican.
4. Refus des tarifs vides et des écritures de vente sans tarif.
5. Règles avec accès écriture limité aux collections, interdiction des champs inconnus et des modifications des ventes déjà confirmées.
6. Contrôle des prix enregistrés par rapport à `/shared/prices/<productId>` et des timestamps contre `now`.
7. Tarifs Pelican/Heineken obligatoirement identiques pour les mêmes contenances.
8. Interdiction d'attribuer le rôle `admin` à un autre UID que le propriétaire connu.

## Vérifications effectuées SANS utiliser la vraie base

- Syntaxe JavaScript : deux scripts parsés avec succès.
- Tests de fonctions Firebase isolées : **9/9 conformes** (initialisation sans écrasement, 78 prix, prix Pelican, timestamp vente/inventaire/mouvement/annulation, interdiction du tarif nul).
- Simulation partielle des expressions de sécurité : **20/20 conformes** (rôles, prix modifiés, timestamps falsifiés, quantités invalides, champs inconnus, écrasements, etc.).
- Ces simulations ne sont **pas** le moteur réel de règles Firebase ; elles ne remplacent pas Firebase Emulator/Rules Playground.

## Vérifications restantes avant la production

1. Faire valider les 78 tarifs de référence de `catalogue-prix-a-verifier.json` avec l'établissement.
2. Tester les règles dans le **simulateur officiel Firebase** sans cliquer sur « Publier ».
3. Dans un environnement d'essai isolé, vérifier le batch `update()`, l'horodatage `serverTimestamp()` et les cas d'écriture malveillante avec le moteur Firebase.
4. Publier le nouveau client avant les règles renforcées, initialiser les tarifs sans écraser les anciens, puis confirmer la lecture de 78 prix.
5. Déployer les règles durcies **uniquement après** l'ensemble des vérifications.
6. Tester deux utilisateurs, l'annulation d'un lot, la coupure réseau, l'export **et la restauration**.
7. Revoir la synchronisation volumineuse de `/shared` (quotas gratuits), la politique de sauvegarde et le calendrier de conservation.

## Test suivant sans danger

Dans Firebase Console > Realtime Database > Règles :

1. Copier les règles du fichier `firebase.rules.v6.hardening-draft.json` dans **l'éditeur**, sans cliquer « Publier ».
2. Ouvrir « Espace de test dédié aux règles » et sélectionner `set`.
3. Chemin : `/shared/test_ecriture`, utilisateur authentifié administrateur, données fictives `{"controle":"test"}`.
4. **Résultat attendu : refusé**. Si la console ne permet pas de simuler un brouillon non publié, ne publier aucune règle et signaler ce point.

Une copie des anciennes règles actives doit être conservée avant tout déploiement.

## Limites de sécurité à garder visibles

La date commerciale `YYYY-MM-DD` est contrôlée en forme, mais peut être saisie pour un autre jour : l'horodatage serveur constitue l'audit technique fiable. La restauration automatique des sauvegardes et une stratégie de reprise après incident ne sont pas encore développées. Ne pas utiliser le portail pour stocker des données personnelles de clients.
