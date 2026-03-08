import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles, Users, Briefcase, Zap, Heart, Shield, TrendingUp, Target, Rocket, CheckCircle, ArrowRight, Star, MessageSquare, FileText, CreditCard, BarChart3, Handshake, BadgePercent, HelpCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <SEOHead
        title="Partnery - Connectez créateurs et marques"
        description="Plateforme de mise en relation entre créateurs de contenu et marques pour des collaborations sponsoring authentiques et équitables. Commission de 5% uniquement."
      />
      {/* Header fixe */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Partnery</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#tarifs" className="text-foreground hover:text-primary transition-colors font-medium">
                Tarifs
              </a>
              <a href="#fonctionnalites" className="text-foreground hover:text-primary transition-colors font-medium">
                Fonctionnalités
              </a>
              <a href="#fonctionnement" className="text-foreground hover:text-primary transition-colors font-medium">
                Fonctionnement
              </a>
              <a href="#benefices" className="text-foreground hover:text-primary transition-colors font-medium">
                Bénéfices
              </a>
              <a href="#faq" className="text-foreground hover:text-primary transition-colors font-medium">
                FAQ
              </a>
            </nav>

            <Link to="/auth">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft font-semibold">
                Rejoindre Partnery
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-4 bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">100% gratuit • Commission 5% uniquement</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
                Connectez marques et créateurs{" "}
                <span className="text-primary">directement</span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Partnery élimine les intermédiaires et facilite les partenariats authentiques. 
                Inscription gratuite, sans abonnement. Vous ne payez que 5% sur vos transactions réussies.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-medium text-lg px-8 py-6 w-full sm:w-auto">
                    Commencer gratuitement
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <a href="#tarifs">
                  <Button size="lg" variant="outline" className="border-2 border-primary text-foreground hover:bg-primary/10 text-lg px-8 py-6 w-full sm:w-auto">
                    Voir nos tarifs
                  </Button>
                </a>
              </div>
            </motion.div>

            {/* Illustration Hero */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />
              <div className="relative bg-card border-2 border-primary/20 rounded-3xl p-8 shadow-glow">
                <div className="space-y-6">
                  {/* Card exemple marque */}
                  <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                        <Briefcase className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="font-bold text-foreground">Marque</div>
                        <div className="text-sm text-muted-foreground">Recherche créateurs</div>
                      </div>
                    </div>
                    <p className="text-sm text-foreground/80">Publiez vos opportunités de partenariat</p>
                  </div>

                  {/* Flèche de connexion */}
                  <div className="flex justify-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-medium">
                      <Heart className="h-6 w-6 text-white" />
                    </div>
                  </div>

                  {/* Card exemple créateur */}
                  <div className="bg-secondary/10 rounded-2xl p-6 border border-secondary/20">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                        <Users className="h-6 w-6 text-secondary-foreground" />
                      </div>
                      <div>
                        <div className="font-bold text-foreground">Créateur</div>
                        <div className="text-sm text-muted-foreground">Proposez vos services</div>
                      </div>
                    </div>
                    <p className="text-sm text-foreground/80">Créez votre pitch et attirez des marques</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section Modèle Économique Transparent */}
      <section id="tarifs" className="py-24 px-4 bg-card">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
              <BadgePercent className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-foreground">Tarification transparente</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              100% Gratuit pour démarrer
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Pas d'abonnement, pas de frais cachés. Vous ne payez que lorsque vous réussissez.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-background rounded-3xl p-8 border-2 border-primary/20 hover:border-primary/40 transition-all hover:shadow-soft text-center"
            >
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Inscription gratuite</h3>
              <p className="text-muted-foreground leading-relaxed">
                Créez votre profil, publiez vos offres ou pitchs, et explorez la plateforme sans aucun frais.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-8 border-2 border-primary/40 shadow-soft text-center relative"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-semibold rounded-full">
                Notre modèle
              </div>
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <BadgePercent className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-4xl font-bold text-primary mb-2">5%</h3>
              <h4 className="text-xl font-bold text-foreground mb-4">Commission uniquement</h4>
              <p className="text-muted-foreground leading-relaxed">
                Prélevée sur les transactions réussies. Les créateurs reçoivent 95% du montant payé par la marque.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-background rounded-3xl p-8 border-2 border-secondary/20 hover:border-secondary/40 transition-all hover:shadow-soft text-center"
            >
              <div className="w-16 h-16 bg-secondary/20 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <TrendingUp className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Agences : 15-30% de commission</h3>
              <p className="text-muted-foreground leading-relaxed">
                Les agences traditionnelles prélèvent 15 à 30% sur chaque collaboration. Partnery est <span className="font-semibold text-foreground">100% gratuit à l'inscription</span>, avec seulement 5% sur les transactions réussies.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section Fonctionnalités */}
      <section id="fonctionnalites" className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full mb-4">
              <Rocket className="h-5 w-5 text-secondary" />
              <span className="text-sm font-semibold text-foreground">Nos outils</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Une plateforme complète pour gérer vos partenariats de A à Z.
            </p>
          </motion.div>

          <motion.div 
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.15,
                  delayChildren: 0.1
                }
              }
            }}
          >
            {[
              { icon: MessageSquare, title: "Messagerie intégrée", desc: "Discutez directement avec vos partenaires potentiels sans quitter la plateforme.", color: "primary" },
              { icon: FileText, title: "Contrats sécurisés", desc: "Créez et signez des contrats collaboratifs avec suivi des modifications.", color: "secondary" },
              { icon: CreditCard, title: "Paiements sécurisés", desc: "Transactions protégées via Stripe. Paiement libéré après validation.", color: "primary" },
              { icon: BarChart3, title: "Tableau de bord", desc: "Suivez vos statistiques, revenus et performances en temps réel.", color: "secondary" },
              { icon: Handshake, title: "Gestion des partenariats", desc: "Organisez tous vos contrats, conversations et paiements en un seul endroit.", color: "primary" },
              { icon: Shield, title: "Profils vérifiés", desc: "Collaborez en confiance avec des profils authentiques et vérifiés.", color: "secondary" }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { 
                    opacity: 0, 
                    y: 60,
                    scale: 0.8,
                    rotateX: -15
                  },
                  visible: { 
                    opacity: 1, 
                    y: 0,
                    scale: 1,
                    rotateX: 0,
                    transition: {
                      type: "spring",
                      stiffness: 100,
                      damping: 12,
                      duration: 0.6
                    }
                  }
                }}
                whileHover={{ 
                  y: -12,
                  scale: 1.03,
                  rotateY: 5,
                  transition: { 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 20 
                  }
                }}
                whileTap={{ scale: 0.98 }}
                className={`bg-card rounded-3xl p-8 border-2 ${feature.color === 'primary' ? 'border-primary/20 hover:border-primary/50' : 'border-secondary/20 hover:border-secondary/50'} transition-colors cursor-pointer group`}
                style={{ transformStyle: "preserve-3d", perspective: 1000 }}
              >
                <motion.div 
                  className={`w-14 h-14 ${feature.color === 'primary' ? 'bg-primary/20 group-hover:bg-primary/30' : 'bg-secondary/20 group-hover:bg-secondary/30'} rounded-2xl flex items-center justify-center mb-6 transition-colors`}
                  whileHover={{ 
                    rotate: [0, -10, 10, -10, 0],
                    transition: { duration: 0.5 }
                  }}
                >
                  <feature.icon className={`h-7 w-7 ${feature.color === 'primary' ? 'text-primary' : 'text-secondary'} transition-transform group-hover:scale-110`} />
                </motion.div>
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                
                {/* Effet de glow au hover */}
                <motion.div 
                  className={`absolute inset-0 rounded-3xl ${feature.color === 'primary' ? 'bg-primary/5' : 'bg-secondary/5'} opacity-0 group-hover:opacity-100 transition-opacity -z-10`}
                  initial={false}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Section Notre Mission */}
      <section id="valeur" className="py-24 px-4 bg-card">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
              <Target className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-foreground">Notre mission</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Éliminer les intermédiaires
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Notre objectif est de créer un écosystème transparent où marques et créateurs 
              peuvent collaborer directement, sans agences coûteuses.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-background rounded-3xl p-8 border-2 border-primary/20 hover:border-primary/40 transition-all hover:shadow-soft"
            >
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Connexion directe</h3>
              <p className="text-muted-foreground leading-relaxed">
                Plus besoin de passer par des agences. Discutez, négociez et collaborez 
                directement avec vos partenaires.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-background rounded-3xl p-8 border-2 border-secondary/20 hover:border-secondary/40 transition-all hover:shadow-soft"
            >
              <div className="w-16 h-16 bg-secondary/20 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Transparence totale</h3>
              <p className="text-muted-foreground leading-relaxed">
                Pas de frais cachés, pas de surprises. Notre commission de 5% est claire 
                et visible dès le départ.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-background rounded-3xl p-8 border-2 border-primary/20 hover:border-primary/40 transition-all hover:shadow-soft"
            >
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Équitable pour tous</h3>
              <p className="text-muted-foreground leading-relaxed">
                Les créateurs gardent plus de revenus, les marques paient moins. 
                Tout le monde y gagne.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section Comment ça marche */}
      <section id="fonctionnement" className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full mb-4">
              <Zap className="h-5 w-5 text-secondary" />
              <span className="text-sm font-semibold text-foreground">Comment ça marche</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              3 étapes simples
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Rejoignez Partnery et lancez-vous en quelques minutes.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Etape 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="w-24 h-24 rounded-full bg-primary/10 text-primary font-bold text-3xl flex items-center justify-center mx-auto mb-6 border-2 border-primary/20">
                1
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Inscription gratuite</h3>
              <p className="text-muted-foreground leading-relaxed">
                Créez votre profil en quelques clics, que vous soyez une marque ou un créateur. C'est 100% gratuit.
              </p>
            </motion.div>

            {/* Etape 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-center"
            >
              <div className="w-24 h-24 rounded-full bg-secondary/10 text-secondary font-bold text-3xl flex items-center justify-center mx-auto mb-6 border-2 border-secondary/20">
                2
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Trouvez & Discutez</h3>
              <p className="text-muted-foreground leading-relaxed">
                Explorez les profils, envoyez des messages et négociez vos partenariats directement.
              </p>
            </motion.div>

            {/* Etape 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center"
            >
              <div className="w-24 h-24 rounded-full bg-primary/10 text-primary font-bold text-3xl flex items-center justify-center mx-auto mb-6 border-2 border-primary/20">
                3
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Collaborez & Payez</h3>
              <p className="text-muted-foreground leading-relaxed">
                Signez un contrat sécurisé et effectuez le paiement. Nous ne prenons que 5% de commission.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section Bénéfices */}
      <section id="benefices" className="py-24 px-4 bg-card">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
              <Star className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-foreground">Vos avantages</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Pourquoi choisir Partnery ?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Des avantages concrets pour les marques et les créateurs.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Bénéfices Marque */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h3 className="text-3xl font-bold text-foreground mb-4">Pour les marques</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground">Inscription 100% gratuite</span> — contrairement aux autres plateformes, aucun abonnement ni frais caché. Seulement 5% sur les collaborations réussies.
                  </p>
                </li>
                <li className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground">Contact direct</span> avec les créateurs sans intermédiaire pour des négociations transparentes.
                  </p>
                </li>
                <li className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground">Contrats sécurisés</span> avec suivi des livrables et paiements protégés.
                  </p>
                </li>
              </ul>
            </motion.div>

            {/* Bénéfices Créateur */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h3 className="text-3xl font-bold text-foreground mb-4">Pour les créateurs</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-secondary flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground">Gardez 95% de vos revenus</span> au lieu des 70-85% avec les agences.
                  </p>
                </li>
                <li className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-secondary flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground">Visibilité accrue</span> auprès des marques qui recherchent activement des créateurs.
                  </p>
                </li>
                <li className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-secondary flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground">Paiements garantis</span> avec un système de validation sécurisé.
                  </p>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section Pourquoi Partnery ? */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
              <Rocket className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-foreground">Nos engagements</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Une plateforme pensée pour vous
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Nous nous engageons à maintenir une plateforme transparente, équitable et efficace.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            {[
              { icon: Zap, title: "Rapidité", desc: "Trouvez des partenaires en quelques clics grâce à notre interface intuitive.", color: "primary" },
              { icon: Shield, title: "Sécurité", desc: "Paiements sécurisés, contrats vérifiés et données protégées.", color: "secondary" },
              { icon: Heart, title: "Équité", desc: "Commission transparente et équitable de 5% pour tous.", color: "primary" },
              { icon: Users, title: "Communauté", desc: "Rejoignez un écosystème de marques et créateurs passionnés.", color: "secondary" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex items-start gap-6"
              >
                <div className={`w-16 h-16 ${item.color === 'primary' ? 'bg-primary/20' : 'bg-secondary/20'} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                  <item.icon className={`h-8 w-8 ${item.color === 'primary' ? 'text-primary' : 'text-secondary'}`} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-foreground">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA Final */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mt-16"
          >
            <Link to="/auth">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-medium text-lg px-12 py-7">
                Commencer gratuitement
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">Inscription gratuite • Aucun abonnement • 5% de commission uniquement</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-12 px-4 bg-foreground text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Partnery</div>
              <p className="text-white/70 text-sm leading-relaxed">
                La plateforme qui connecte marques et créateurs directement, sans intermédiaires.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Plateforme</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="#tarifs" className="hover:text-primary transition-colors">Tarifs</a></li>
                <li><a href="#fonctionnalites" className="hover:text-primary transition-colors">Fonctionnalités</a></li>
                <li><a href="#fonctionnement" className="hover:text-primary transition-colors">Comment ça marche</a></li>
                <li><a href="#benefices" className="hover:text-primary transition-colors">Bénéfices</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Ressources</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link to="/discover" className="hover:text-primary transition-colors">Découvrir</Link></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Aide</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-sm text-white/70 mb-4">contact@partnery.app</p>
              <Link to="/auth">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 w-full font-semibold">
                  Commencer gratuitement
                </Button>
              </Link>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-white/60">© 2024 Partnery. Tous droits réservés.</p>
              <div className="flex gap-6 text-sm text-white/60">
                <Link to="/mentions-legales" className="hover:text-primary transition-colors">Mentions légales</Link>
                <Link to="/cgu" className="hover:text-primary transition-colors">CGU</Link>
                <Link to="/politique-confidentialite" className="hover:text-primary transition-colors">Confidentialité</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
