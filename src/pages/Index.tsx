import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowRight,
  BadgePercent,
  Sparkles,
  FileText,
  ShieldCheck,
  Check,
  X,
  Target,
  UserPlus,
  Rocket,
} from "lucide-react";
import SEOHead from "@/components/SEOHead";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Partnery — Les meilleures collabs arrivent à vous, automatiquement"
        description="Les marques déposent leur campagne, Partnery sélectionne automatiquement les créateurs parfaits. Contrat en 1 clic, paiement sécurisé, 5% de commission."
      />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Partnery
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#marques" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Marques</a>
            <a href="#createurs" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Créateurs</a>
            <a href="#comparaison" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Comparaison</a>
            <a href="#faq" className="text-sm font-medium text-foreground hover:text-primary transition-colors">FAQ</a>
          </nav>
          <Link to="/auth">
            <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90 font-semibold">
              Connexion
            </Button>
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="pt-32 pb-24 px-4 bg-secondary/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/60 via-secondary/30 to-primary/10 pointer-events-none" />
        <div className="container mx-auto max-w-5xl relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-background/70 backdrop-blur rounded-full border border-foreground/10">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Matching automatique • Commission 5%</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.05] tracking-tight">
              Les meilleures collabs arrivent à vous,{" "}
              <span className="text-primary">automatiquement</span>
            </h1>

            <p className="text-xl md:text-2xl text-foreground/70 max-w-3xl mx-auto leading-relaxed">
              Les marques déposent leur campagne. Partnery sélectionne les créateurs parfaits.
              Tout le reste est automatique.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/auth?type=brand">
                <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 shadow-medium text-lg px-8 py-6 w-full sm:w-auto font-semibold">
                  Je suis une marque
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth?type=creator">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-medium text-lg px-8 py-6 w-full sm:w-auto font-semibold">
                  Je suis un créateur
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS BAND */}
      <section className="py-16 px-4 bg-foreground">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: BadgePercent, value: "5%", label: "de commission seulement" },
              { icon: Target, value: "100%", label: "Matching automatique" },
              { icon: FileText, value: "1 clic", label: "Contrat généré" },
              { icon: ShieldCheck, value: "Stripe", label: "Paiement sécurisé" },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="space-y-2"
              >
                <s.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-3xl md:text-4xl font-bold text-background">{s.value}</div>
                <div className="text-background/70 text-sm font-medium">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* POUR LES MARQUES */}
      <section id="marques" className="py-24 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
              <span className="text-sm font-semibold text-primary">Pour les marques</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Lancez une campagne en 3 minutes
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { n: "1", title: "Vous définissez votre budget et vos critères", desc: "Thématique d'audience, taille minimale, plateformes, nombre de créateurs, deadline." },
              { n: "2", title: "On sélectionne automatiquement les créateurs qui correspondent", desc: "L'algorithme trouve les meilleurs profils pour votre campagne." },
              { n: "3", title: "Vous validez, on gère le contrat et le paiement", desc: "Contrat auto-généré, paiement sécurisé Stripe, tout est traçable." },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-card rounded-3xl p-8 border-2 border-border hover:border-primary/40 transition-colors"
              >
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center text-xl font-bold mb-6">
                  {step.n}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3 leading-snug">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/auth?type=brand">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-medium text-lg px-8 py-6 font-semibold">
                <Rocket className="mr-2 h-5 w-5" />
                Lancer ma première campagne
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* POUR LES CRÉATEURS */}
      <section id="createurs" className="py-24 px-4 bg-secondary/20">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/40 rounded-full mb-4">
              <span className="text-sm font-semibold text-foreground">Pour les créateurs</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Les opportunités viennent à vous
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { n: "1", title: "Vous créez votre profil en quelques minutes", desc: "Plateformes, taille d'audience, thématiques abordées, formats proposés (post, story, vidéo, UGC…) et tarif par collab." },
              { n: "2", title: "Vous recevez des propositions adaptées à votre audience", desc: "Fini le démarchage : les marques alignées avec votre profil viennent directement à vous." },
              { n: "3", title: "Vous acceptez en un clic, le contrat est prêt", desc: "Paiement séquestré, livraison, libération des fonds. Zero friction." },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-background rounded-3xl p-8 border-2 border-border hover:border-secondary transition-colors"
              >
                <div className="w-12 h-12 bg-secondary text-secondary-foreground rounded-2xl flex items-center justify-center text-xl font-bold mb-6">
                  {step.n}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3 leading-snug">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/auth?type=creator">
              <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-medium text-lg px-8 py-6 font-semibold">
                <UserPlus className="mr-2 h-5 w-5" />
                Créer mon profil créateur
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* COMPARAISON */}
      <section id="comparaison" className="py-24 px-4 bg-background">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Partnery vs agences traditionnelles
            </h2>
            <p className="text-lg text-muted-foreground">La différence est nette.</p>
          </motion.div>

          <div className="overflow-x-auto">
            <table className="w-full bg-card rounded-3xl border-2 border-border overflow-hidden">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left p-6 text-foreground font-bold"></th>
                  <th className="p-6 text-center text-muted-foreground font-semibold">Agences traditionnelles</th>
                  <th className="p-6 text-center text-primary font-bold bg-primary/5">Partnery</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { k: "Commission", a: "20-30%", p: "5%" },
                  { k: "Recherche de créateurs", a: "Manuelle", p: "Automatique" },
                  { k: "Contrats", a: "Gérés par l'agence", p: "Générés en 1 clic" },
                  { k: "Petits créateurs", a: "Ignorés", p: "Priorité" },
                  { k: "Paiements", a: "Délais longs", p: "Stripe sécurisé" },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-border last:border-b-0">
                    <td className="p-6 font-semibold text-foreground">{row.k}</td>
                    <td className="p-6 text-center text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <X className="h-4 w-4 text-muted-foreground/60" />
                        {row.a}
                      </div>
                    </td>
                    <td className="p-6 text-center font-semibold text-foreground bg-primary/5">
                      <div className="flex items-center justify-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        {row.p}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Témoignages retirés — pas de faux avis */}

      {/* CTA FINAL */}
      <section className="py-24 px-4 bg-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-background leading-tight">
              Prêt à lancer votre première campagne ?
            </h2>
            <p className="text-lg md:text-xl text-background/70">
              Inscription gratuite. 5% seulement sur les collabs réussies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/auth?type=brand">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 w-full sm:w-auto font-semibold">
                  Je suis une marque
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth?type=creator">
                <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-lg px-8 py-6 w-full sm:w-auto font-semibold">
                  Je suis un créateur
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-4 bg-background">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Questions fréquentes
            </h2>
          </motion.div>

          <Accordion type="single" collapsible className="space-y-4">
            {[
              {
                q: "Comment fonctionne le matching ?",
                a: "Lorsqu'une marque lance une campagne, notre algorithme filtre les créateurs par niche, taille d'audience et tarif, puis propose à la marque les meilleurs profils. La marque valide, le créateur accepte, la collab démarre.",
              },
              {
                q: "Combien ça coûte ?",
                a: "L'inscription est 100% gratuite pour les marques comme pour les créateurs. Partnery prélève uniquement 5% de commission sur chaque collab réussie — contre 20 à 30% en agence.",
              },
              {
                q: "Comment sont sécurisés les paiements ?",
                a: "Tous les paiements passent par Stripe. Les fonds sont séquestrés à la commande et libérés au créateur après validation de la livraison. Aucune donnée bancaire n'est stockée chez nous.",
              },
              {
                q: "Que se passe-t-il si une collab ne se passe pas bien ?",
                a: "Un système de litige intégré permet à chaque partie de déposer des preuves. Notre équipe médiation tranche sous 72h : libération des fonds, remboursement partiel ou total selon les cas.",
              },
              {
                q: "C'est gratuit pour les créateurs ?",
                a: "Oui, totalement. Les créateurs ne paient jamais rien : ni inscription, ni abonnement, ni frais cachés. Ils reçoivent 95% du montant payé par la marque (5% de commission côté marque).",
              },
            ].map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="bg-card border-2 border-border rounded-2xl px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary py-5">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-background border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Partnery
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <Link to="/cgu" className="hover:text-primary transition-colors">CGU</Link>
              <Link to="/mentions-legales" className="hover:text-primary transition-colors">Mentions légales</Link>
              <Link to="/politique-confidentialite" className="hover:text-primary transition-colors">Confidentialité</Link>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Partnery
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
