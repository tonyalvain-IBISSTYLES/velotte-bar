# Velotte Bar V6.1 — expérience d'équipe (pilote)

**Date : 11 novembre 2026 — statut : À RECETTER, PAS EN PRODUCTION**

## Où se trouvent les changements ?

- `v61/index.html` : copie autonome de la V6 (78 produits, identité visuelle et outils existants conservés).
- `v61/ux.js` et `v61/ux.css` : surcouche de praticité, réversible.
- `tests/v61-smoke.mjs` : contrôles de syntaxe et scénarios simulés, sans compte Firebase réel.

Aucun fichier V5, V6 ou règle Firebase n'est modifié dans ce chantier.

## Améliorations apportées

1. **Vente express** : 8 produits fréquents proposés en tête. Priorité au top des 30 derniers jours, complété par des boissons habituelles si l'historique est encore vide. Un clic ajoute au panier sans encaisser.
2. **Recherche tolérante** : accents/majuscules, « zéro », « soda », « café », « jus » ; catégories et panier V6 conservés.
3. **Inventaire assisté** : avant validation, aperçu des écarts entre comptage et situation théorique, avec avertissement pour les comptages antidatés. Un écart n'est pas une preuve de perte.
4. **Enregistrement plus sûr** : blocage des commandes concurrentes pendant la validation, réutilisation des ID de vente pour une tentative incertaine, contrôle en lecture après échec Firebase ; en aucun cas une vente n'est affichée comme confirmée sans preuve.
5. **Profils plus lisibles** : réception = ventes, stocks consultables, inventaire, guide ; responsable = mêmes fonctions + mouvements, seuils, rapports et journal ; administrateur = toutes les fonctions. Les permissions effectives restent celles des règles Firebase.
6. **Journal** : ventes, inventaires, mouvements, annulations, horodatages et identifiants Firebase abrégés ; export CSV pour responsable et admin. Aucun prénom ni adresse personnelle stockés en journal.
7. **Rapprochement OPERA** : saisie temporaire des montants OPERA par code 2701/2702, comparaison avec les ventes tarifées du site, export CSV. Les montants OPERA ne sont PAS écrits dans Firebase.
8. **Guidage** : bannière de précaution sur les doubles saisies, messages plus cohérents, écrans utilisables sur mobile ; jauges de fûts et seuils existants conservés.

## Limitations à connaître

- V6.1 est raccordée au projet **velotte-bar-test**, avec sa propre base Realtime Database. Les brouillons et sauvegardes locales utilisent des clés dédiées à cette recette.
- Le brouillon n'est pas une sauvegarde serveur ; le navigateur ne garantit pas sa conservation si les données du site sont effacées.
- Le contrôle d'une tentative de vente au réseau incertain n'est possible qu'après récupération de la connexion : si aucune confirmation n'est disponible, vérifier l'historique avant tout nouvel essai.
- Les liens OPERA sont manuels ; aucune API ou connexion directe n'a été ajoutée.
- Les rôles masquent certaines pages pour la facilité d'usage, **ceci ne remplace pas les règles Firebase**.
- Les opérations d'annulation et d'inventaire ne sont pas entièrement idempotentes : maintenir les vérifications humaines.
- Aucun test auprès de Cathy et Fan ni sur les appareils de réception n'a encore été réalisé.
- Aucun chiffre réel de productivité ni de fiabilité ne peut être affirmé avant un essai au poste.

## Conditions AVANT mise en service

1. Exporter les données actuelles et confirmer le fichier de sauvegarde.
2. Vérifier les 78 tarifs officiels et l'initialisation des tarifs Firebase.
3. Adapter et valider les règles dans le projet TEST uniquement. Toute publication en production reste une étape séparée après recette et autorisation.
4. Tester les scénarios avec une **instance Firebase de test séparée** : réception, responsable, admins, deux navigateurs simultanés, expiration réseau, ventes, 8 L et inventaires.
5. Tester les profils de Cathy et Fan avec des comptes de test autorisés. Ne pas utiliser de mots de passe réels dans un dépôt ou un rapport.
6. Mesurer à la réception : nombre de clics, délai de saisie, doublons, écarts inventaire et taux de double saisie OPERA/Velotte Bar.
7. Garder la PR en brouillon pendant la recette. Préparer séparément le déploiement et sa configuration après validation ; cette branche utilise Firebase TEST.

## Test automatique

```bash
node tests/v61-smoke.mjs
```

Ce test vérifie la **syntaxe et quelques scénarios avec des fonctions simulées**. Il ne remplace pas un essai réel Firebase, la revue des règles d'accès ou le test de l'ergonomie au comptoir.

## Préparation Firebase TEST

- Projet : `velotte-bar-test`.
- Base : `https://velotte-bar-test-default-rtdb.europe-west1.firebasedatabase.app`.
- Les règles restent verrouillées tant que la configuration des rôles de test n’est pas validée.
- Créer uniquement des comptes fictifs de recette. Attribuer le premier rôle `admin` dans la console TEST, au chemin `roles/<UID_TEST>`. Aucun UID administrateur de production n’est repris dans la V6.1.
- La recette réelle (ventes, inventaires, rôles, synchronisation et coupures réseau) reste à exécuter. Les contrôles CI sont des simulations.
