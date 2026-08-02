# Étape 7 — Dashboard analytics

Dernière étape du chantier. Aucun changement de design : mêmes cartes, mêmes couleurs saumon/bleu, mêmes composants de graphique déjà présents (`ChartContainer`, `AreaChart`).

## 1. Dashboard marque (`/dashboard` côté marque)

Bandeau de 4 indicateurs en haut, au-dessus de la liste des campagnes :
- Campagnes actives
- Créateurs en collab (collabs `escrowed` / `delivered`)
- Budget engagé (somme des collabs payées, en €)
- Taux d'acceptation des créateurs (acceptés / proposés)

Puis deux blocs côte à côte :
- **Évolution des dépenses** sur 6 mois (graphique en aire, réutilise `SpendingChart` existant, alimenté par les collabs de la marque)
- **Performance partenariats** (réutilise `BrandPerformanceStats`, branché sur campagnes/collabs réelles)

Et un mini-entonnoir par campagne : matchés → validés par la marque → acceptés par le créateur → payés → livrés.

## 2. Dashboard créateur (`/dashboard` côté créateur)

Bandeau de 4 indicateurs :
- Revenus perçus (collabs `released`, net de commission)
- En attente de libération (collabs `escrowed` + `delivered`)
- Collabs terminées
- Taux d'acceptation des propositions reçues

Puis :
- **Évolution des revenus** sur 6 mois (réutilise `RevenueChart`)
- **Performance** (réutilise `PerformanceStats`, adapté : propositions reçues / acceptées / collabs / délai moyen de livraison)

## 3. Onglet Analytics dans `/admin`

Nouvel onglet à côté de Stats / Grille tarifaire / Réglages :
- Courbe du volume total (GMV) et des revenus Partnery sur 6 mois
- Répartition des collabs par statut
- Répartition des campagnes par réseau (Instagram / TikTok / YouTube)
- Top 5 marques par volume et top 5 créateurs par revenus
- Taux de conversion global : campagnes créées → collabs payées

## Détails techniques

- Tout est calculé côté client à partir de requêtes filtrées par RLS existantes (`campaigns`, `campaign_matches`, `collabs`, `payments`). Aucune nouvelle table.
- Un hook partagé `useDashboardAnalytics` regroupe les agrégations mensuelles pour éviter la duplication entre les trois écrans.
- Les composants graphiques existants (`RevenueChart`, `SpendingChart`, `PerformanceStats`, `BrandPerformanceStats`) sont réutilisés et branchés sur les vraies données, sans retouche de style.
- Les montants sont affichés en €, cohérents avec le reste de l'app.

## Correctif inclus

`CreatorDashboard` crée aujourd'hui la collab avec une commission codée en dur à **5 %**, alors que l'étape 1 a fixé la commission par défaut à **15 %** en base (`platform_settings`). Je corrige pour lire la valeur en base, sinon les chiffres du dashboard seront faux dès la première collab.
