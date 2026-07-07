# Refonte Partnery — MVP matching automatique

Objectif : simplifier radicalement le produit à **5 écrans** avec matching automatique, en conservant la charte (saumon #FF8A7A / bleu #6EC8FF / noir #1B1B1B, logo, style épuré).

## Périmètre — ce qui reste / ce qui part

**On garde :** design system, auth, profils, Stripe, contrats (simplifiés + auto), litiges (backend + admin), CGU/mentions légales, commission 5%.

**On supprime des routes accessibles :** Discover, CreatePitch, PitchDetail, CreateOpportunity (form manuel), OpportunityDetail, PublicProfile browsing, Wallet exposé, recherche manuelle. Messages est **conservé mais restreint aux collabs actives uniquement**.

Les anciennes pages restent dans le repo (non liées) pour ne rien casser côté data ; seules les routes/nav sont retirées.

## Les 5 écrans

1. **Onboarding (3 étapes)** — `/onboarding`
   - Étape 1 : rôle (marque / créateur)
   - Étape 2 marque : nom société, secteur, logo ; créateur : niche (catégorie), taille d'audience, tarif/collab (€)
   - Étape 3 : réseaux sociaux (créateur) / site + description (marque)
   - Redirige vers le dashboard correspondant

2. **Dashboard marque** — `/dashboard` (si `user_type=brand`)
   - CTA "Créer une campagne"
   - Liste des campagnes : statut (brouillon / en cours / complète), #matchés, #acceptés, budget

3. **Créer une campagne** — `/campaigns/new`
   - Champs : nom, description courte, budget total (€), nb créateurs voulus, niche, audience min, date limite
   - Bouton "Lancer" → génère les matchs et affiche la liste des créateurs proposés à valider/refuser

4. **Dashboard créateur** — `/dashboard` (si `user_type=creator`)
   - Liste des propositions matchées : marque, campagne, budget par créateur (= budget/nb), deadline, niche
   - Boutons "Accepter" / "Refuser" en 1 clic

5. **Collab active** — `/collab/:id`
   - Contrat auto-généré (résumé lisible)
   - Bouton paiement Stripe (séquestre) côté marque, statut côté créateur
   - Statut collab : en attente paiement → fonds séquestrés → livré → validé/libéré
   - Accès messagerie limité à cette collab

## Modèle de données (ajouts)

Nouvelles tables (les anciennes `pitches`, `brand_opportunities`, `contracts` restent en place mais ne sont plus utilisées par le nouveau flux) :

- **campaigns** : `id, brand_id, name, description, budget_total, creators_wanted, niche_category_id, min_audience, deadline, status(draft|matching|active|completed), created_at, updated_at`
- **campaign_matches** : `id, campaign_id, creator_id, match_score, brand_status(pending|approved|rejected), creator_status(pending|accepted|refused), created_at`
- **collabs** : `id, campaign_id, creator_id, match_id, amount, commission, status(awaiting_payment|escrowed|delivered|released|refunded|disputed), stripe_payment_intent, created_at`

Ajouts profils créateur : `niche_category_id` (existe via `category_id`), `audience_size`, `rate_per_collab`.

RLS : marque voit ses campagnes/matches/collabs ; créateur voit ses matches où `brand_status=approved` et ses collabs. GRANTs authenticated + service_role.

Matching (côté serveur, edge function `match-campaign`) :
- filtre `creator_profiles` par `category_id = niche`, `audience_size >= min_audience`, `rate_per_collab <= budget/creators_wanted`
- score simple = audience normalisée + proximité tarif
- insère top N (N = `creators_wanted * 3`) dans `campaign_matches`

## Paiement

Edge function `create-collab-payment` : PaymentIntent Stripe, montant = `budget/creators_wanted`, commission 5% appliquée côté serveur, fonds retenus. Webhook `stripe-webhook` (déjà présent) étendu : marque payante → `collabs.status=escrowed`. Bouton "Valider livraison" côté marque → `released` + transfert (futur Connect ; pour le MVP on marque released et on log).

## Navigation

`Header` simplifié : Logo, Dashboard, Messages (collabs actives), Profil, Déconnexion. Suppression des liens Discover / Create pitch / Create opportunity.

`App.tsx` routes actives :
```
/  /auth  /onboarding  /dashboard  /campaigns/new  /campaigns/:id
/collab/:id  /messages (filtré)  /profile
/admin/*  /cgu  /mentions-legales  /politique-confidentialite  /reset-password
```

## Détails techniques

- Nouveau hook `useUserType()` pour router le bon dashboard.
- `Dashboard.tsx` devient un aiguilleur → `BrandDashboard` / `CreatorDashboard` (2 composants).
- Réutilisation des tokens Tailwind existants (aucun hex en dur).
- CGU : ajouter une clause courte "matching automatique, la marque garde le dernier mot sur la sélection".
- Onboarding remplace le flux profil existant mais réutilise `useProfileCompletion`.

## Livrables ordonnés

1. Migration DB (campaigns, campaign_matches, collabs, colonnes créateur) + GRANTs + RLS.
2. Edge functions `match-campaign`, `create-collab-payment` + extension webhook.
3. Pages : `Onboarding`, `BrandDashboard`, `CreatorDashboard`, `CampaignNew`, `CampaignDetail` (validation matchs), `CollabActive`.
4. Refonte `App.tsx` + `Header.tsx` (masquer anciennes routes).
5. CGU maj (clause matching auto).
6. Test manuel bout-en-bout via Playwright.

## Questions ouvertes (à confirmer avant build)

- Les anciens contrats/pitches/opportunités existants doivent-ils être **archivés** (invisibles) ou **migrés** dans le nouveau modèle ? Par défaut : archivés (visibles seulement en admin).
- Paiement : un paiement par créateur accepté (recommandé, plus simple) ou un seul paiement global à la création de la campagne ? Par défaut : **un paiement par créateur** au moment où la marque valide + le créateur accepte.
