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
  Check,
  X,
  Star,
  Sliders,
  Heart,
  PackageCheck,
  UserPlus,
  Inbox,
  Wallet,
  Gift,
  BadgePercent,
  ShieldCheck,
  BadgeCheck,
  TrendingUp,
} from "lucide-react";
import SEOHead from "@/components/SEOHead";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5 },
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Partnery — Le marketing d'influence, enfin accessible"
        description="Les marques lancent leurs campagnes en 3 minutes, les créateurs reçoivent des opportunités sans chercher. Matching automatique, contrat en 1 clic, paiement sécurisé."
      />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Partnery
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#marques" className="text-sm font-medium text-foreground hover:text-secondary transition-colors">Marques</a>
            <a href="#createurs" className="text-sm font-medium text-foreground hover:text-secondary transition-colors">Créateurs</a>
            <a href="#comparaison" className="text-sm font-medium text-foreground hover:text-secondary transition-colors">Comparaison</a>
            <a href="#faq" className="text-sm font-medium text-foreground hover:text-secondary transition-colors">FAQ</a>
          </nav>
          <Link to="/auth">
            <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90 font-semibold">
              Connexion
            </Button>
          </Link>
        </div>
      </header>

      {/* 1 — HERO */}
      <section className="pt-36 pb-28 px-4 relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/15 via-secondary/5 to-background pointer-events-none" />
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-secondary/20 blur-3xl pointer-events-none" />
        <div className="container mx-auto max-w-5xl relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-8"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.05] tracking-tight">
              Le marketing d'influence,{" "}
              <span className="text-secondary">enfin accessible.</span>
            </h1>

            <p className="text-xl md:text-2xl text-foreground/70 max-w-3xl mx-auto leading-relaxed">
              Les marques lancent leurs campagnes en 3 minutes. Les créateurs reçoivent
              des opportunités sans chercher. Tout le reste est automatique.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link to="/auth?type=brand">
                <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-medium text-lg px-8 py-6 w-full sm:w-auto font-semibold">
                  Je suis une marque
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth?type=creator">
                <Button size="lg" variant="outline" className="border-2 border-foreground/20 text-foreground hover:bg-foreground/5 text-lg px-8 py-6 w-full sm:w-auto font-semibold">
                  Je suis un créateur
                </Button>
              </Link>
            </div>

            <p className="text-sm text-muted-foreground">
              Gratuit pour les créateurs. Aucune commission cachée pour les marques.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2 — LE PROBLÈME */}
      <section className="py-24 px-4 bg-muted">
        <div className="container mx-auto max-w-6xl">
          <motion.h2 {...fadeUp} className="text-3xl md:text-4xl font-bold text-foreground text-center mb-14">
            Le marketing d'influence aujourd'hui, c'est ça :
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              "Des agences qui prennent 20 à 30% de commission sur chaque collab.",
              "Des créateurs qui passent des heures à chercher des partenariats sans réponse.",
              "Des échanges éparpillés entre mails, DMs et contrats bricolés.",
            ].map((t, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-background rounded-3xl p-8 border border-border"
              >
                <div className="w-11 h-11 rounded-2xl bg-destructive/10 flex items-center justify-center mb-5">
                  <X className="h-5 w-5 text-destructive" />
                </div>
                <p className="text-foreground/80 leading-relaxed">{t}</p>
              </motion.div>
            ))}
          </div>

          <motion.p {...fadeUp} className="text-center italic text-xl md:text-2xl text-foreground mt-14">
            Il y a une meilleure façon de faire.
          </motion.p>
        </div>
      </section>

      {/* 3 — LA RÉVÉLATION */}
      <section className="py-24 px-4 bg-secondary/20">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.h2 {...fadeUp} className="text-3xl md:text-5xl font-bold text-foreground mb-8 leading-tight">
            Les marques qui gagnent vraiment avec l'influence, vous savez ce qu'elles font ?
          </motion.h2>
          <motion.p {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }} className="text-lg md:text-xl text-foreground/75 leading-relaxed">
            Elles ne misent pas sur un seul gros influenceur à 500 000 abonnés. Elles travaillent
            avec 50 créateurs authentiques, chacun avec sa propre communauté engagée. Résultat :
            plus de portée, plus de confiance, moins de budget gaspillé. Partnery rend ça possible
            pour n'importe quelle marque, en quelques minutes.
          </motion.p>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-12 bg-background rounded-3xl border-2 border-secondary/40 p-8 md:p-10 shadow-soft"
          >
            <TrendingUp className="h-8 w-8 text-secondary mx-auto mb-4" />
            <p className="text-xl md:text-2xl font-bold text-foreground leading-snug">
              Un micro-influenceur génère en moyenne{" "}
              <span className="text-secondary">7x plus d'engagement</span> qu'un compte à 1 million d'abonnés.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 4 — MARQUES */}
      <section id="marques" className="py-24 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Pour les marques : lancez une campagne comme jamais avant
            </h2>
            <p className="text-muted-foreground text-lg">Sans agence. Sans négociation. Sans prise de tête.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { n: "1", icon: Sliders, title: "Vous configurez", desc: "Choisissez votre budget, le type de créateurs, le réseau social. Notre outil calcule en temps réel la portée estimée et le prix conseillé. Pas de surprise." },
              { n: "2", icon: Heart, title: "Vous validez", desc: "On vous propose les créateurs qui correspondent. Vous les validez ou les refusez en un coup d'œil, comme sur une application de rencontre mais pour vos campagnes." },
              { n: "3", icon: PackageCheck, title: "On s'occupe du reste", desc: "Contrat automatique, paiement sécurisé, suivi de campagne. Vous recevez un rapport de performance à la fin." },
            ].map((s, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-card rounded-3xl p-8 border-2 border-border hover:border-secondary/40 transition-colors"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-secondary text-secondary-foreground rounded-2xl flex items-center justify-center text-xl font-bold">
                    {s.n}
                  </div>
                  <s.icon className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3">{s.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeUp} className="text-center">
            <Link to="/auth?type=brand">
              <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-medium text-lg px-8 py-6 font-semibold">
                Lancer ma première campagne
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 5 — CRÉATEURS */}
      <section id="createurs" className="py-24 px-4 bg-secondary/10">
        <div className="container mx-auto max-w-6xl">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Pour les créateurs : fini de courir après les marques
            </h2>
            <p className="text-muted-foreground text-lg">Gratuit. Toujours.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { n: "1", icon: UserPlus, title: "Vous créez votre profil", desc: "Connectez votre compte Instagram ou TikTok. Vos stats sont vérifiées automatiquement. Ça prend 2 minutes." },
              { n: "2", icon: Inbox, title: "Les opportunités viennent à vous", desc: "Les marques qui correspondent à votre univers vous envoient des propositions directement. Vous choisissez ce qui vous intéresse." },
              { n: "3", icon: Wallet, title: "Vous êtes payé, c'est tout", desc: "Acceptez, publiez, soyez payé via Stripe. Pas d'intermédiaire, pas de relance, pas d'impayé." },
            ].map((s, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-background rounded-3xl p-8 border-2 border-border hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center text-xl font-bold">
                    {s.n}
                  </div>
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3">{s.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeUp} className="text-center">
            <Link to="/auth?type=creator">
              <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 shadow-medium text-lg px-8 py-6 font-semibold">
                Créer mon profil gratuit
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 6 — ARGUMENTS CLÉS */}
      <section className="py-24 px-4 bg-foreground">
        <div className="container mx-auto max-w-5xl">
          <motion.h2 {...fadeUp} className="text-3xl md:text-5xl font-bold text-background text-center mb-14">
            Pourquoi Partnery, concrètement ?
          </motion.h2>

          <div className="space-y-5">
            {[
              { icon: Gift, key: "Gratuit pour les créateurs", desc: "Toujours. Pas d'abonnement, pas de commission prélevée sur votre rémunération. Ce que la marque vous propose, vous le touchez en entier." },
              { icon: BadgePercent, key: "3x moins cher qu'une agence", desc: "Les agences prennent 20 à 30%. Partnery prend une commission fixe sur le budget campagne, invisible pour les créateurs, bien inférieure au marché pour les marques." },
              { icon: ShieldCheck, key: "Paiement garanti", desc: "Le budget est mis en séquestre dès le lancement. Vous publiez, vous êtes payé. Aucun risque d'impayé." },
              { icon: BadgeCheck, key: "Vérification automatique", desc: "Tous les créateurs connectent leur compte. Les stats sont réelles et vérifiées. Les marques ne paient que pour une vraie audience." },
            ].map((c, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex flex-col sm:flex-row sm:items-center gap-5 bg-background/5 border border-background/10 rounded-3xl p-7"
              >
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-secondary/20 flex items-center justify-center">
                  <c.icon className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-secondary mb-1">{c.key}</h3>
                  <p className="text-background/70 leading-relaxed">{c.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7 — COMPARAISON */}
      <section id="comparaison" className="py-24 px-4 bg-background">
        <div className="container mx-auto max-w-5xl">
          <motion.h2 {...fadeUp} className="text-3xl md:text-5xl font-bold text-foreground text-center mb-14">
            Partnery vs le reste du monde
          </motion.h2>

          <motion.div {...fadeUp} className="overflow-x-auto">
            <table className="w-full bg-card rounded-3xl border-2 border-border overflow-hidden">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left p-5 md:p-6 text-foreground font-bold"></th>
                  <th className="p-5 md:p-6 text-center text-muted-foreground font-semibold">Agence traditionnelle</th>
                  <th className="p-5 md:p-6 text-center text-secondary font-bold bg-secondary/5">Partnery</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { k: "Commission", a: "20 à 30%", p: "Incluse et compétitive" },
                  { k: "Accès aux créateurs", a: "Manuel et lent", p: "Matching automatique" },
                  { k: "Contrats", a: "Gérés par l'agence", p: "Générés en 1 clic" },
                  { k: "Paiements", a: "Délais longs", p: "Stripe sécurisé" },
                  { k: "Petits créateurs", a: "Ignorés", p: "Priorité" },
                  { k: "Transparence des stats", a: "Aucune", p: "Vérifiées et garanties" },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-border last:border-b-0">
                    <td className="p-5 md:p-6 font-semibold text-foreground">{row.k}</td>
                    <td className="p-5 md:p-6 text-center text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <X className="h-4 w-4 text-destructive shrink-0" />
                        {row.a}
                      </div>
                    </td>
                    <td className="p-5 md:p-6 text-center font-semibold text-foreground bg-secondary/5">
                      <div className="flex items-center justify-center gap-2">
                        <Check className="h-4 w-4 text-green-600 shrink-0" />
                        {row.p}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* 8 — Témoignages retirés tant qu'il n'y a pas de vrais avis clients */}



      {/* 9 — CTA FINAL */}
      <section className="py-28 px-4 bg-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div {...fadeUp} className="space-y-8">
            <h2 className="text-4xl md:text-6xl font-bold text-background leading-tight">
              Votre prochaine campagne commence ici.
            </h2>
            <p className="text-lg md:text-xl text-background/70">
              Les marques configurent en 3 minutes. Les créateurs s'inscrivent en 2 minutes.
              Tout le monde est payé à temps.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center pt-2">
              <Link to="/auth?type=brand">
                <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-lg px-10 py-7 w-full sm:w-auto font-semibold">
                  Lancer une campagne
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth?type=creator">
                <Button size="lg" variant="outline" className="border-2 border-background/40 bg-transparent text-background hover:bg-background/10 hover:text-background text-lg px-10 py-7 w-full sm:w-auto font-semibold">
                  Rejoindre en tant que créateur
                </Button>
              </Link>
            </div>
            <p className="text-xs text-background/50 pt-4">
              Aucune carte bancaire requise pour les créateurs. Paiement sécurisé via Stripe pour les marques.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 10 — FAQ */}
      <section id="faq" className="py-24 px-4 bg-background">
        <div className="container mx-auto max-w-3xl">
          <motion.h2 {...fadeUp} className="text-3xl md:text-5xl font-bold text-foreground text-center mb-12">
            Questions fréquentes
          </motion.h2>

          <Accordion type="single" collapsible className="space-y-4">
            {[
              {
                q: "Est-ce vraiment gratuit pour les créateurs ?",
                a: "Oui, totalement et définitivement. Partnery ne prélève jamais rien sur la rémunération des créateurs. Ce que la marque vous propose, vous le recevez intégralement via Stripe.",
              },
              {
                q: "Comment sont calculés les prix des campagnes ?",
                a: "Vous configurez le nombre de créateurs et leur taille d'audience. L'outil calcule automatiquement la portée estimée et affiche un prix minimum et un prix conseillé basés sur les tarifs réels du marché. Vous choisissez votre budget librement entre ces deux bornes.",
              },
              {
                q: "Comment Partnery vérifie les créateurs ?",
                a: "Chaque créateur connecte son compte Instagram ou TikTok à l'inscription. On récupère ses vraies statistiques directement depuis les plateformes. Pas de chiffres déclarés, pas de triche possible.",
              },
              {
                q: "Que se passe-t-il si un créateur ne publie pas ?",
                a: "Le budget est en séquestre chez Stripe. Si le créateur ne respecte pas la deadline, le paiement ne lui est pas versé et vous pouvez sélectionner un remplaçant. Vous êtes protégé dans tous les cas.",
              },
              {
                q: "En cas de problème, qui contacte-t-on ?",
                a: "Un bouton « Signaler un problème » est disponible sur chaque collab active. L'équipe Partnery intervient manuellement pour trouver une solution amiable.",
              },
            ].map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="bg-card border-2 border-border rounded-2xl px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:text-secondary py-5">
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
              <Link to="/cgu" className="hover:text-secondary transition-colors">CGU</Link>
              <Link to="/politique-confidentialite" className="hover:text-secondary transition-colors">Politique de confidentialité</Link>
              <Link to="/mentions-legales" className="hover:text-secondary transition-colors">Mentions légales</Link>
              <a href="mailto:contact@partnery.app" className="hover:text-secondary transition-colors">Contact</a>
            </div>
            <div className="text-sm text-muted-foreground">© Partnery 2026</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
