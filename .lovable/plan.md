

# Ajout des pages légales obligatoires

## Pages a creer

### 1. Mentions Legales (`src/pages/MentionsLegales.tsx`)
- Editeur du site (nom, adresse, contact)
- Hebergeur (Lovable / Supabase)
- Directeur de publication
- Propriete intellectuelle

### 2. Conditions Generales d'Utilisation (`src/pages/CGU.tsx`)
- Objet et acceptation des CGU
- Inscription et comptes utilisateurs
- Description des services (mise en relation marques/createurs)
- Modele economique : commission de 5% sur les transactions
- Obligations des utilisateurs (marques et createurs)
- Contrats et paiements
- Responsabilite de la plateforme
- Resiliation et suppression de compte
- Modification des CGU

### 3. Politique de Confidentialite (`src/pages/PolitiqueConfidentialite.tsx`)
- Donnees collectees (email, profil, transactions)
- Finalite du traitement
- Base legale (RGPD)
- Duree de conservation
- Droits des utilisateurs (acces, rectification, suppression)
- Cookies
- Contact DPO

## Modifications existantes

### Routes (`src/App.tsx`)
- Ajout de 3 routes : `/mentions-legales`, `/cgu`, `/politique-confidentialite`

### Footer de la landing page (`src/pages/Index.tsx`)
- Ajout de liens vers les 3 pages legales dans le footer existant

## Details techniques

- Chaque page utilise les composants UI existants (Card, etc.)
- Design coherent avec le reste du site (meme header/footer style)
- Pages accessibles sans authentification
- Contenu structure avec des sections Accordion pour la lisibilite
- Textes adaptes au contexte de Partnery (plateforme de mise en relation marques-createurs, commission 5%, paiements Stripe)

