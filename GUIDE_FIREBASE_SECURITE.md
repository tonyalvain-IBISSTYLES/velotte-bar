# Velotte Bar — Première configuration Firebase (sécurisée)

Projet : `velotte-bar-56947` ; base Realtime Database en région `europe-west1`.

## Étape actuelle — administrateur seul

1. Firebase Console > Realtime Database > onglet **Règles**.
2. Remplacer les règles par le contenu de `firebase.rules.json` et cliquer **Publier**.
3. La base reste fermée à tous les visiteurs non authentifiés.
4. Seul l'utilisateur administrateur préconfiguré peut écrire dans `shared` et attribuer les rôles dans `roles`.
5. Les autres utilisateurs authentifiés ne peuvent lire `shared` que s'ils ont déjà reçu un rôle `reception` ou `responsable`. **Aucun collègue ne peut encore écrire** : c'est volontaire en attendant la V6 collaborative et les règles de validation par type d'opération.

## Ne pas confondre

- Le dépôt GitHub public contient le code, pas des données de l'hôtel.
- Publier ce fichier GitHub ne **change pas automatiquement les règles de Firebase** ; seule leur publication dans la console les rend actives.
- Le site V5 reste un prototype à sauvegarde locale ; **il n'est pas encore connecté à Firebase**.
- Les sauvegardes administrées de la base ne sont pas incluses dans le forfait Spark : prévoir des exports indépendants et tester la restauration.

## Étapes suivantes

1. Développer en parallèle la V6 Firebase sur un chemin de préproduction, sans écraser la V5.
2. Séparer chaque vente/inventaire/mouvement pour éviter d'écraser les modifications concurrentes.
3. Ajouter des validations strictes des opérations et des permissions par fonction.
4. Tester deux sessions utilisateurs et un cas de déconnexion avant usage collectif.
5. Prévoir export, restauration, et journal de modifications.

Ne jamais publier mots de passe, jetons d'accès ni comptes de service dans le dépôt.
