# Mise en service contrôlée — Velotte Bar V6

**Version préparée le 10 novembre 2026.**
**V5 : inchangée. V6 bêta : code corrigé sur main. Règles Firebase : publication manuelle obligatoire.**

## Ce qui a été validé
- 47/47 tests exécutés sur le moteur officiel Firebase Realtime Database Emulator via GitHub Actions.
- Création de ventes par réception, dont écriture groupée, contrôle des tarifs, champs, horodatages serveur, interdiction de modifier ou supprimer une vente.
- Inventaires, mouvements, seuils, Pelican/Heineken et restrictions par rôle.
- Sauvegarde JSON des données et rôles, puis restauration en sandbox de l'émulateur.
- Tests client simulés complémentaires : 78 prix, 8 L par fût, cohérence des tarifs et des brouillons.

**Limite :** aucun test de deux vrais appareils sur la base de production n'a été réalisé ; le déploiement n'est pas encore complètement validé en conditions réelles.

## Ordre d'activation — respecter les quatre étapes

### 1. Sauvegarde AVANT toute publication de règles
- Ouvrir https://tonyalvain-ibisstyles.github.io/velotte-bar/beta/ et se connecter avec le compte administrateur.
- Aller dans **Réglages & sauvegardes** et cliquer sur **Télécharger la sauvegarde JSON complète (admin)**.
- Confirmer que le fichier .json a bien été enregistré hors du navigateur, et en conserver une copie supplémentaire dans un lieu sécurisé.
- Sous les anciennes règles Firebase, cet export contient les données opérationnelles `shared`, mais **pas encore la liste des rôles**. Le fichier doit mentionner `"rolesExported": false`.
- Si l'export échoue, **ne pas continuer**.

### 2. Vérifier puis initialiser les prix avant publication des nouvelles règles
- Dans les réglages V6, vérifier les tarifs du catalogue (78 produits), en particulier les bières pression.
- Les trois tarifs Pelican héritent de Heineken par contenance ; ils ne sont pas modifiables indépendamment.
- Une fois ces tarifs validés, cliquer **Initialiser les tarifs manquants (administrateur)**.
- Cette opération ne remplace pas les prix déjà présents. Elle refuse les divergences Heineken/Pelican déjà présentes.
- Si un tarif est incorrect ou si le bouton renvoie une erreur, corriger la situation avant de publier.

### 3. Publier les règles renforcées dans Firebase Console
- Ouvrir Firebase Console → projet **velotte-bar-56947** → Realtime Database → **Règles**.
- Remplacer **la totalité** des règles non publiées éventuellement présentes dans l'éditeur par le contenu exact du fichier :
  https://github.com/tonyalvain-IBISSTYLES/velotte-bar/blob/main/firebase.rules.v6.json
- Vérifier que l'éditeur contient les règles complètes et que le début inclut `roles`, puis `shared` avec `".write": false`.
- **Seulement après la sauvegarde et l'initialisation des prix :** cliquer sur **Publier**.
- Ne pas publier un ancien brouillon sauvegardé dans le navigateur.

### 4. Contrôler l'activation
- Recharger la V6 bêta puis se reconnecter.
- Depuis le compte admin, refaire une sauvegarde JSON : maintenant `"rolesExported": true` et `roles` doivent être présents.
- Avec un collègue autorisé en réception, lors d'une **vraie vente**, contrôler que la confirmation Firebase apparaît, que la vente remonte sur un deuxième appareil, et que les stocks sont cohérents.
- Vérifier que réception ne peut pas modifier les tarifs ou annuler les ventes.
- Vérifier qu'une coupure réseau empêche une fausse confirmation d'enregistrement.

## Si une étape ne fonctionne pas
- **Ne pas ressaisir la même vente** sans vérifier l'historique.
- Ne pas vider Firebase ni importer une sauvegarde dans la base de production.
- Conserver les captures de l'erreur et l'export JSON, sans transmettre de mots de passe.
- Les règles initiales se trouvent dans `firebase.rules.json` pour référence, mais leur remise en place réintroduirait un droit d'écriture administrateur trop large : uniquement comme éventuel repli sous contrôle.

## Restauration et limite du système gratuit
- La sauvegarde complète (après changement des règles) inclut `shared` et `roles`, **pas** les comptes Firebase Authentication ni les mots de passe.
- La restauration a été testée dans l'émulateur, pas en production. Les règles V6 interdisent volontairement la restauration directe depuis un navigateur, pour éviter l'écrasement général.
- Toute restauration réelle devra être administrée dans un environnement isolé et validée avant import.
- La mise en service ne garantit pas une absence de panne ; programmer un export sécurisé régulier des données et vérifier les quotas de Firebase Spark.

## Liens techniques
- V6 bêta : https://tonyalvain-ibisstyles.github.io/velotte-bar/beta/
- Règles finales : https://github.com/tonyalvain-IBISSTYLES/velotte-bar/blob/main/firebase.rules.v6.json
- Historique et tests : https://github.com/tonyalvain-IBISSTYLES/velotte-bar/actions/workflows/velotte-v6-security.yml
