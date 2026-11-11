# Étape 2 — Bouteilles entamées (Velotte Bar V6.1)

**Date : 11 novembre 2026 · Statut : développé et testé en émulateur, non déployé sur l'hôtel**

## Nouvelle logique de saisie

- **Bouteille :** saisie à deux décimales au maximum (1 = bouteille pleine, 0,5 = moitié, 1,4 = une pleine et 40 % d'une deuxième).
- **Litres :** conserver les litres pour Heineken et Pelican (3 fûts de 8 L = 24 L).
- **Unités :** continuer à compter entiers les canettes, capsules, petites bouteilles vendues individuellement.
- Une bouteille entamée servie à la dose reste dans le mode de contrôle manuel : pas de déduction automatique des doses avant confirmation du volume et de la recette.

## Complément de l'inventaire historique du 10 octobre 2026

Source : onglet **BAR ALCOOL** du fichier `10 OCT 26.xlsx`. Les données déjà enregistrées en production concernent 37 références ; ne pas les écraser.

| Article source | Code stock | Article Velotte Bar | Quantité (bouteille) | Correspondance |
|---|---|---|---:|---|
| Martini rouge | s043 | Martini Rouge | 1,4 | Directe |
| Campari | s046 | Campari | 1,6 | Directe |
| Whisky J&B | s064 | J&B Rare | 1,1 | **À confirmer** |
| Cognac Courvoisier | s069 | Cognac Courvoisier | 0,4 | Directe |
| Rhum Havana | s070 | Rhum Havana | 0,4 | Directe |
| Get 27 | s072 | Get 27 | 0,7 | Directe |
| Bailey's | s073 | Bailey's | 0,5 | Directe |

Autres articles qui **ne doivent pas être rapprochés automatiquement** : *Poire William* n'est pas une correspondance garantie avec *Eau de Vie Poire* ; les crèmes de cassis/mûre ne sont pas les sirops correspondants, et certains whiskies portent des références trop peu précises. Ils restent hors import.

## Statut technique

- Version modifiée : `v61/index.html` sur branche `feature/v61-experience-equipe-20261111`.
- Règles de test : `v61/firebase.rules.test.json`.
- Tests de sécurité : `tests/rules-v61-test.mjs` avec 56 contrôles ; tests de saisie : `tests/v61-smoke.mjs`.
- Les fichiers de la V6 de production et les règles publiées en production **ne sont pas modifiés**.

## Procédure de reprise des bouteilles historiques — UNIQUEMENT APRÈS RECETTE

1. Valider la V6.1 sur Firebase TEST, avec un compte fictif `reception` puis `responsable`.
2. Vérifier les 78 références, les conversions de stock, les compteurs et une sauvegarde restaurable.
3. Avant tout déploiement réel, relire les **règles effectivement publiées** dans la base de production et préparer une migration validée (la modification du fichier GitHub seule ne change pas ces règles).
4. Sur une V6.1 approuvée et correctement raccordée à la production, ajouter un **nouvel inventaire partiel daté du 10/10/2026** pour les bouteilles concernées, avec une note comme « Complément inventaire historique du 10/10/2026, bouteilles entamées ».
5. **Ne pas modifier le relevé déjà importé et ne pas importer le CSV directement dans `shared` ou `shared/inventories`**. L'interface créée un nouvel identifiant, afin de conserver l'historique et les ventes.
6. Vérifier les sept valeurs et les stocks résultants ; exclure J&B Rare tant que sa référence n'est pas confirmée.
7. Le stock actuel de novembre devra ensuite être recalé par un **nouveau comptage physique**, car octobre est une photographie historique.

**Aucune saisie réelle ni migration de la production n'a été exécutée dans cette étape.**
