# Velotte Bar — V6 bêta collaborative

## Contenu
- `index.html` : interface héritée de la V5, avec toutes les rubriques et 78 boissons, logo intégré.
- `cloud.js` : Firebase Authentication + Realtime Database. Les identifiants des comptes restent chez Firebase (ne pas les partager).
- `firebase.rules.v6.json` : règles plus précises pour l'accès des collaborateurs ; à publier MANUELLEMENT dans Firebase.

## Où tester
`https://tonyalvain-ibisstyles.github.io/velotte-bar/beta/`

La V5 d'origine reste à la racine `/velotte-bar/` et n'est pas modifiée.

## Mise en service progressive
1. Dans Firebase → Authentication, vérifier que la connexion e-mail / mot de passe est activée.
2. Vérifier que Realtime Database est sur Spark et que les règles actuellement publiées permettent au premier administrateur d'accéder à `roles/{UID}` et à `shared`.
3. Tester la V6 bêta avec le compte administrateur ; un premier rôle `admin` peut être créé automatiquement si l'UID correspond à l'identifiant configuré.
4. Après validation des tests administrateur, copier le contenu de `firebase.rules.v6.json` dans **Realtime Database → Règles** puis **Publier**. Les fichiers publiés dans GitHub n'appliquent pas automatiquement des règles sur Firebase.
5. Créer les comptes des collègues dans Firebase → Authentication → Utilisateurs. Copier leur UID. Dans V6 → Gérer les accès, attribuer `reception` ou `responsable`.
6. Tester une vente de démonstration simultanément sur deux navigateurs, puis vérifier que les chiffres et les fûts sont identiques.
7. Avant l'utilisation réelle, valider la protection des accès avec l'outil de test de règles Firebase ; tester les interdictions d'écriture du rôle réception sur prix, mouvements et rôles.
8. Enregistrer les données de **test uniquement** jusqu'à validation du directeur, des procédures d'export, de restauration, et du suivi des stocks.

## Pourquoi les ventes ne s'écrasent plus
Chaque lot de vente comporte des identifiants uniques et est sauvegardé sous `shared/sales/<id>` ; les inventaires et mouvements sont enregistrés de la même façon. Les clients écoutent les changements sur `shared` et recalculent les niveaux affichés.

## Sécurité / limitations
- Le dépôt GitHub est public : ne jamais y publier de mot de passe, de clé de compte de service, de dossier de sauvegarde ou de données de l'hôtel.
- `firebaseConfig` dans le navigateur est normal : l'accès aux données dépend de Firebase Auth **et** de règles côté serveur.
- V6 reste une **bêta**. Le stockage des brouillons est local ; les validations serveur nécessitent une connexion. Le navigateur web Firebase ne garantit pas la persistance d'une écriture hors ligne après fermeture de l'onglet.
- Les sauvegardes administrées par Firebase sont indisponibles dans Spark. Télécharger régulièrement « sauvegarde JSON » dans Réglages, stocker les copies ailleurs, et prévoir une vraie procédure de restauration testée.
- Les opérations annulées restent présentes en base comme historique ; les totaux retirent les lots annulés.
- Le rôle `admin` accède à tous les réglages. Le rôle `responsable` peut aussi corriger les stocks et annuler des lots. Le rôle `reception` peut enregistrer ventes et inventaires.
- Le site ne communique pas avec OPERA Cloud : conserver la saisie OPERA sous codes 2701 / 2702.
- L'offre Spark est gratuite dans ses quotas ; saturation ou panne reste possible, il n'existe pas de garantie absolue de disponibilité.

## Vérifications réalisées
Tests sur navigateur local avec **services Firebase simulés** : authentification administrateur, navigation, 78 références, vente, inventaire, mise à jour de la vue stock, gestion des rôles, format mobile, absence d'erreurs JavaScript détectées. **Le service Firebase réel et les règles publiées sur ton compte restent à tester dans la console.**