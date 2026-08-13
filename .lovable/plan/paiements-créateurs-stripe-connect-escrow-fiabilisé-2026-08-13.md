# Paiements créateurs (Stripe Connect) + escrow fiabilisé

Deux chantiers liés : payer les créateurs automatiquement, et rendre le séquestre des collabs fiable de bout en bout.

## Constat (vérifié dans le code)

- `create-collab-payment` crée une session Stripe en capture manuelle puis passe la collab en `escrowed` immédiatement, avant tout paiement réel. Une marque qui abandonne le checkout laisse une collab marquée « fonds sécurisés » alors que rien n'est payé.
- `stripe-webhook` ne traite que la table `payments` (messagerie). Il ignore totalement les collabs : aucun événement `checkout.session.*` ni `payment_intent.amount_capturable_updated` n'est géré.
- Les retraits (`withdrawals`) sont une simple ligne en base avec un IBAN saisi à la main ; aucun virement n'est déclenché, un admin doit payer manuellement.
- Le solde du wallet est calculé sur la table `payments` uniquement — les collabs `released` n'alimentent pas le solde du créateur.

## Ce qui va être construit

### 1. Escrow fiable

- La collab reste en `awaiting_payment` tant que Stripe n'a pas confirmé l'autorisation. Elle passe en `escrowed` uniquement via le webhook.
- Le webhook gère : autorisation réussie (fonds bloqués), checkout expiré/annulé (retour en `awaiting_payment` + notification marque), capture réussie (`released`), remboursement (`refunded`).
- Page collab : statut « paiement en cours de confirmation » pendant l'attente, avec rafraîchissement automatique au retour du checkout.
- Anti-doublon : une session déjà ouverte est réutilisée au lieu d'en créer une seconde.

### 2. Paiements créateurs automatiques (Stripe Connect)

- Le créateur crée son compte de paiement depuis le Wallet (onboarding Stripe hébergé : identité, IBAN, fiscalité). Statut affiché : à compléter / en cours de vérification / actif.
- Une fois la collab libérée, le montant net (montant − commission) est crédité au créateur ; le solde du Wallet inclut désormais les collabs libérées, plus seulement les anciens paiements de messagerie.
- Le retrait déclenche un virement Stripe réel vers le compte connecté, sans IBAN saisi dans Partnery. Statuts suivis automatiquement (en cours, payé, échoué).
- Retrait bloqué tant que le compte Connect n'est pas actif, avec message explicite.
- L'admin garde une vue des retraits mais n'a plus à payer à la main.

### 3. Cohérence

- Le solde disponible se calcule à partir des collabs libérées + paiements complétés − retraits en cours/effectués.
- L'auto-release à 7 jours continue de fonctionner et alimente le même circuit.

## Détails techniques

- Migration : table `connect_accounts` (user_id, stripe_account_id, status charges/payouts enabled) avec GRANT + RLS propriétaire ; colonnes `stripe_transfer_id` et `failure_reason` sur `withdrawals` ; index sur `collabs.stripe_payment_intent`.
- Nouvelles edge functions : `connect-onboarding` (création compte Express + lien d'onboarding + refresh statut), `request-payout` (validation solde côté serveur, `transfers.create` puis `payouts`), toutes avec vérification JWT en code et validation Zod.
- `stripe-webhook` : ajout des cas `checkout.session.completed`, `checkout.session.expired`, `payment_intent.amount_capturable_updated`, `payment_intent.canceled`, `charge.refunded`, `transfer.*`/`payout.*` pour les retraits, en s'appuyant sur `metadata.collab_id`.
- `create-collab-payment` : ne met plus à jour le statut, stocke seulement `stripe_payment_intent` / session id.
- `src/pages/Wallet.tsx` : bloc « Compte de paiement » (onboarding Connect) et retrait sans IBAN ; recalcul du solde incluant `collabs.status = released`.
- `src/pages/CollabActive.tsx` : état intermédiaire « paiement en attente de confirmation ».

## À noter

Stripe Connect exige que le compte Stripe de Partnery soit activé pour les paiements de plateforme (Connect activé dans le dashboard Stripe). En test, l'onboarding fonctionne avec les données de démonstration Stripe.
