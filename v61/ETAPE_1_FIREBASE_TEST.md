# Étape 1 — Validation de Firebase TEST pour Velotte Bar V6.1

**Date : 11 novembre 2026 · Statut : préparation, AUCUNE publication de règle effectuée depuis GitHub**

## Périmètre des projets

| Usage | Projet Firebase | Base | Autorisation de modification |
|---|---|---|---|
| Essais V6.1 | `velotte-bar-test` | `https://velotte-bar-test-default-rtdb.europe-west1.firebasedatabase.app` | Test uniquement, après contrôle |
| Exploitation V6 | `velotte-bar-56947` | Base de production | **Aucune opération dans cette étape** |

La branche GitHub V6.1 utilise la configuration TEST. Le dépôt contient une copie de règles propre à la recette : `v61/firebase.rules.test.json`, **non déployée par la création du fichier**.

## A. Vérifier dans Firebase Console (lecture seule)

- [ ] Se rendre sur https://console.firebase.google.com/project/velotte-bar-test/overview et vérifier que l'identifiant affiché est exactement `velotte-bar-test`.
- [ ] Dans **Authentication**, vérifier que le service existe et que **Adresse e-mail/Mot de passe** est activé ; ne pas créer de vrais comptes d'employés à ce stade.
- [ ] Dans **Realtime Database**, vérifier que la base utilisée porte exactement l'adresse TEST ci-dessus et qu'elle est située en Europe (`europe-west1`).
- [ ] Lire les règles **actuellement publiées** et confirmer que tout accès anonyme à `roles` et `shared` est refusé. Ne pas présumer qu'un fichier GitHub équivaut à une règle publiée.
- [ ] Relever la date de dernière publication des règles et le nombre de comptes de test visibles ; ne copier ici aucun UID, mot de passe ou donnée confidentielle.
- [ ] Contrôler le plan Firebase et les quotas pertinents avant le pilote.

**Si le projet TEST n'existe pas, si le nom de base diffère ou si des règles publiques sont détectées : STOP ; corriger le projet TEST avant de tester.**

## B. Valider les règles avec l'émulateur Firebase (sans vraie base)

- Jeu de règles : `v61/firebase.rules.test.json`.
- Config de test : `v61/firebase.test.audit.json`.
- Test automatisé : `tests/rules-v61-test.mjs` (47 contrôles indépendants).
- CI : `.github/workflows/velotte-v61-firebase-test.yml`.

La suite vérifie notamment : accès anonyme refusé, refus d'un compte sans rôle, permissions réception/responsable/admin, écriture des ventes à horodatage serveur, prix du catalogue, opérations non modifiables, inventaires unités/litres, annulations, export et restauration **dans l'émulateur**.

Pour tester localement (Node.js 22, Java 21 et Firebase CLI disponibles) :

```sh
npm install --no-save --no-package-lock --legacy-peer-deps firebase-tools@14 @firebase/rules-unit-testing@4 firebase@11
npx firebase emulators:exec --only database --project demo-velotte-v61-test-security --config v61/firebase.test.audit.json "node tests/rules-v61-test.mjs"
```

**Ne jamais utiliser un identifiant de projet de production dans cette commande.**

## C. Préparer les accès fictifs uniquement en TEST

Après validation de l'émulateur et lecture des règles TEST :

1. Créer des identifiants fictifs dédiés au pilote **uniquement dans Authentication du projet `velotte-bar-test`**, avec mots de passe uniques gérés hors du dépôt et de la conversation.
2. À l'aide de la console d'administration autorisée du projet TEST, initialiser le rôle du premier compte au chemin `roles/<UID_TEST_ADMIN>` avec la valeur texte `admin`. Les règles ne permettent pas qu'un simple utilisateur s'auto-attribue ce rôle.
3. Vérifier l'accès de cet administrateur fictif ; lui faire attribuer `responsable` et `reception` aux autres comptes fictifs.
4. Initialiser dans le projet TEST uniquement les 78 tarifs vérifiés ; les codes OPERA 2701 et 2702 sont des catégories d'export, pas des comptes de caisse Firebase.
5. Exporter une sauvegarde JSON des données TEST avant tout scénario destructif.

Ne **jamais** réutiliser l'UID administrateur de production ni les mots de passe des collègues. Aucun compte réel de Cathy ou Fan à cette étape.

## D. Scénarios réels à valider dans la base TEST (à exécuter ultérieurement)

- [ ] Session réception : vente simple, recherche, panier, inventaire, refus de modification des tarifs et rôles.
- [ ] Session responsable : corrections de stock, seuils, annulations motivées et lecture du journal.
- [ ] Session administrateur : initialisation des tarifs, sauvegarde JSON, attribution/révocation des rôles.
- [ ] Deux navigateurs : ventes simultanées et synchronisation cohérente, sans écrasement d'historique.
- [ ] Connexion coupée : brouillon conservé, aucune confirmation mensongère, pas de double vente à la reconnexion.
- [ ] Fûts 8 litres : deux ventes de 25 cl retirent 0,50 L ; les stocks Pelican et Heineken restent séparés.
- [ ] Inventaire : zéro et non compté distingués, anomalies expliquées et corrections traçables.
- [ ] Double saisie : enregistrement OPERA (2701/2702) toujours requis ; les montants OPERA restent non synchronisés.
- [ ] Déconnexion/révocation : aucune donnée partagée accessible après le retrait du rôle.

## E. Feu vert / blocage

**Feu vert pour la recette humaine** uniquement si A est confirmé, B a réussi et C est préparé sur le projet TEST.

**Mise en service sur le projet de production : interdite à ce stade.** Elle exige un autre accord, une sauvegarde réelle vérifiée, la validation du catalogue et les tests multi-appareils. La PR #1 reste en brouillon.

## Références

- PR V6.1 : https://github.com/tonyalvain-IBISSTYLES/velotte-bar/pull/1
- Configuration V6.1 : `v61/index.html` (projet TEST)
- Règles projet TEST : `v61/firebase.rules.test.json`
- Anciennes règles V6 de production : `firebase.rules.v6.json` (à ne PAS réutiliser telles quelles en TEST)
