# Brancher les pages inaccessibles

Six pages existent dans le code mais n'ont aucune route dans `App.tsx` : Wallet, ContractDetail, Discover, PublicProfile, OpportunityDetail, PitchDetail. Résultat : tous les liens déjà présents dans l'app (liste des contrats dans Messages, cartes profils/pitches, bouton contrat des litiges admin) tombent sur la page 404.

## Ce qui sera fait

1. **Portefeuille** — route `/wallet` : solde disponible, statut Stripe Connect, demandes de retrait. Ajout d'une entrée "Portefeuille" dans le menu du header (desktop + mobile) pour que ce soit atteignable sans URL manuelle.
2. **Contrats** — route `/contract/:id` (la forme déjà utilisée par tous les liens existants : ContractList, CreateContractDialog, Messages, AdminDisputes). Les liens fonctionneront immédiatement, sans modifier les composants.
3. **Profil public** — route `/profile/:id`, utilisée par Messages, les cartes Discover et les cartes profil.
4. **Découverte** — route `/discover`.
5. **Opportunité** — route `/opportunity/:id` et **Pitch** — route `/pitch/:id`, utilisées par MyContentList, PublicProfile et les cartes Discover.

Les pages Discover / Opportunity / Pitch appartiennent à l'ancien modèle marketplace (avant le matching automatique). Elles seront branchées et accessibles par lien, mais **pas ajoutées à la navigation principale** pour ne pas brouiller le parcours MVP (matching + collab). Seul le Portefeuille rejoint le menu.

## Détails techniques

- `src/App.tsx` : 6 imports + 6 `<Route>` ajoutés avant la route `*`.
- `src/components/Header.tsx` : lien `/wallet` dans le menu utilisateur (desktop et mobile).
- Ces pages gèrent déjà leur propre garde d'authentification (redirection vers `/auth`) et leurs `useParams`, donc aucune modification de leur contenu n'est nécessaire.
- Vérification finale : typecheck + parcours des routes dans la preview pour confirmer qu'aucune ne renvoie 404.

## Hors périmètre

Stripe Connect côté tableau de bord Stripe, webhooks, test end-to-end : à faire après, comme prévu.
