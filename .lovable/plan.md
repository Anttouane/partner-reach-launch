# Réception et validation manuelle des créateurs proposés

Objectif : quand une marque crée une campagne, elle reçoit une liste de créateurs proposés, avec toutes les infos utiles, et valide ou écarte chacun manuellement.

## État actuel (vérifié dans le code)

- `CampaignNew` fait son propre matching côté client à partir de `creator_profiles` uniquement — il ignore les profils vérifiés (`social_verifications`) et le réseau/format choisis.
- La base contient déjà une fonction de matching (`generate_campaign_matches`) qui, elle, ne retient que les créateurs **vérifiés** sur le bon réseau et au-dessus de l'audience minimale. Elle n'est appelée que depuis l'écran swipe.
- `CampaignDetail` affiche une liste basique (nom, audience, tarif) avec Valider / Écarter.
- `CampaignSwipe` affiche des fiches enrichies (handle, followers vérifiés, vues moyennes, engagement, score).
- Le dashboard marque ne signale nulle part « X créateurs attendent votre validation ».

## Ce qui va être construit

### 1. Un seul moteur de matching, fiable
- Suppression du matching artisanal de `CampaignNew` : la création de campagne appellera la fonction de matching de la base (créateurs vérifiés, bon réseau, audience suffisante, thématique respectée).
- Le nombre de candidats proposés est plafonné à environ 3× le nombre de créateurs recherchés, les meilleurs scores d'abord.
- Message clair à la création : « N créateurs proposés » ou, si aucun, « Aucun créateur vérifié ne correspond pour le moment — vous serez prévenue dès qu'un profil correspond ».

### 2. Écran « Créateurs proposés » (validation manuelle)
Nouvel onglet dans la page campagne, en deux modes sur les mêmes données :
- **Mode liste** (par défaut) : cartes créateur avec avatar, nom, badge « profil vérifié », réseau + handle cliquable, audience vérifiée, vues moyennes, taux d'engagement, score de match, bio courte, et boutons Valider / Écarter.
- **Mode swipe** : l'écran existant, accessible via un bouton.
- Filtres simples : à traiter / validés / écartés, et tri par score ou par audience.
- Fiche détaillée au clic : toutes les stats vérifiées, liens réseaux, portfolio si renseigné, historique de collabs terminées.
- Garde-fou : quand le nombre de validés atteint le nombre de créateurs recherchés, un bandeau le signale et propose d'arrêter (validation supplémentaire toujours possible mais confirmée).

### 3. La marque est prévenue
- Notification à la marque dès que des créateurs sont proposés sur une de ses campagnes, avec lien direct vers l'écran de validation.
- Sur le dashboard marque : pastille « N à valider » sur chaque campagne concernée + un bloc en haut listant les campagnes en attente d'action.

### 4. Suivi côté créateur inchangé
Un créateur validé reçoit déjà sa notification et peut accepter/refuser — ce comportement est conservé.

## Détails techniques

- Migration : trigger/notification marque sur insertion dans `campaign_matches` (une notification agrégée par campagne), et ajout d'un plafond de candidats dans `generate_campaign_matches` (paramètre `_limit`).
- `CampaignNew.tsx` : remplacer le bloc de matching client par `supabase.rpc("generate_campaign_matches", ...)`.
- Nouveau composant `src/components/campaigns/CandidateCard.tsx` (carte + actions) et `src/components/campaigns/CandidateDetailDialog.tsx`.
- `CampaignDetail.tsx` : refonte de la section créateurs (onglets Liste/Swipe, filtres, tri) en réutilisant la requête enrichie déjà présente dans `CampaignSwipe.tsx`, extraite dans un hook `useCampaignCandidates`.
- `BrandDashboard.tsx` : compteur `pending` par campagne et bloc « À valider ».
