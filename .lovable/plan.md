

## Plan : Ajouter une section FAQ sur la landing page

### Emplacement
Insérer la FAQ entre la section "Bénéfices" (fin ~ligne 628) et le Footer (ligne 630), avec un lien dans la nav header.

### Contenu
Les 7 questions validées précédemment, implémentées avec le composant `Accordion` existant.

### Changements dans `src/pages/Index.tsx`

1. **Import** : Ajouter `Accordion, AccordionContent, AccordionItem, AccordionTrigger` depuis `@/components/ui/accordion` et `HelpCircle` depuis lucide-react.

2. **Nav header** : Ajouter un lien `FAQ` pointant vers `#faq` dans la nav (après "Bénéfices").

3. **Section FAQ** (avant le footer, ~ligne 629) : Nouvelle section `id="faq"` avec :
   - Titre "Questions fréquentes" + sous-titre
   - Accordion avec les 7 questions :
     1. Partnery est-il gratuit ? → Inscription 100% gratuite, 5% sur collaborations réussies
     2. Comment fonctionne la commission ? → 5% plateforme + ~1.5% + 0.25€ Stripe
     3. Comment sont sécurisés les paiements ? → Stripe, fonds libérés après validation
     4. Partnery remplace-t-il une agence ? → Connexion directe, 5% vs 15-30%
     5. Les contrats sont-ils juridiquement valides ? → Outil de simplification, pas de responsabilité légale
     6. Comment résoudre un litige ? → Système de médiation intégré
     7. Qui peut s'inscrire ? → Tous créateurs et marques, sans condition de taille

4. **Footer** : Mettre à jour le lien FAQ pour pointer vers `#faq`.

