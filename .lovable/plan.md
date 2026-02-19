
# Optimisation SEO complete de Partnery

## 1. Meta tags dynamiques par page

Creation d'un composant `src/components/SEOHead.tsx` utilisant `document.title` et des meta tags dynamiques via `useEffect` (pas besoin d'installer react-helmet, on peut gerer ca nativement).

Chaque page aura son propre titre et description :
- `/` : "Partnery - Connectez createurs et marques"
- `/discover` : "Decouvrir les opportunites | Partnery"
- `/auth` : "Connexion | Partnery"
- `/dashboard` : "Tableau de bord | Partnery"
- `/mentions-legales` : "Mentions legales | Partnery"
- `/cgu` : "Conditions generales d'utilisation | Partnery"
- `/politique-confidentialite` : "Politique de confidentialite | Partnery"
- etc.

## 2. Mise a jour de `index.html`

- Remplacer l'image Open Graph generique (lovable.dev) par une URL propre a Partnery
- Mettre a jour le twitter:site vers un compte Partnery
- Ajouter un lien canonical
- Ajouter la balise `<link rel="sitemap">` vers le sitemap

## 3. Donnees structurees JSON-LD

Ajout dans `index.html` d'un script JSON-LD pour :
- **Organization** : nom, logo, URL, description de Partnery
- **WebSite** : nom du site, URL, description

## 4. Sitemap (`public/sitemap.xml`)

Creation d'un sitemap statique listant toutes les pages publiques :
- `/`
- `/auth`
- `/discover`
- `/mentions-legales`
- `/cgu`
- `/politique-confidentialite`

## 5. Mise a jour de `robots.txt`

Ajout de la reference vers le sitemap :
```
Sitemap: https://partnery.app/sitemap.xml
```

## 6. HTML semantique

Verification et ajout de balises semantiques (`<main>`, `<article>`, `<nav>`, `<section>`) la ou elles manquent, notamment dans la landing page.

## Details techniques

### Fichiers a creer
- `src/components/SEOHead.tsx` : composant reutilisable pour meta tags dynamiques
- `public/sitemap.xml` : sitemap statique

### Fichiers a modifier
- `index.html` : JSON-LD, image OG, canonical
- `public/robots.txt` : ajout sitemap
- `src/pages/Index.tsx` : ajout du composant SEOHead
- `src/pages/Auth.tsx` : ajout SEOHead
- `src/pages/Discover.tsx` : ajout SEOHead
- `src/pages/Dashboard.tsx` : ajout SEOHead
- `src/pages/Profile.tsx` : ajout SEOHead
- `src/pages/Messages.tsx` : ajout SEOHead
- `src/pages/MentionsLegales.tsx` : ajout SEOHead
- `src/pages/CGU.tsx` : ajout SEOHead
- `src/pages/PolitiqueConfidentialite.tsx` : ajout SEOHead
- Autres pages : ajout SEOHead avec titre/description adaptes

### Approche
- Pas de nouvelle dependance : utilisation de `useEffect` natif pour mettre a jour `document.title` et les meta tags
- Le composant SEOHead accepte `title`, `description` et optionnellement `ogImage`
- Copyright mis a jour de 2024 a 2025 dans le footer
