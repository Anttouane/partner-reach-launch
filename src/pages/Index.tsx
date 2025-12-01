import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles, Users, Briefcase, Zap, Heart, Shield, TrendingUp, Target, Rocket, CheckCircle, ArrowRight, Star } from "lucide-react";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      {/* Header fixe */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Partnery</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#valeur" className="text-foreground hover:text-primary transition-colors font-medium">
                Valeur
              </a>
              <a href="#fonctionnement" className="text-foreground hover:text-primary transition-colors font-medium">
                Fonctionnement
              </a>
              <a href="#benefices" className="text-foreground hover:text-primary transition-colors font-medium">
                Bénéfices
              </a>
              <a href="#exemples" className="text-foreground hover:text-primary transition-colors font-medium">
                Exemples
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
                <span className="text-sm font-semibold text-foreground">La plateforme de mise en relation</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
                Connectez marques et créateurs{" "}
                <span className="text-primary">simplement</span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Partnery facilite les collaborations entre marques et créateurs de contenu. 
                Une plateforme moderne, accessible et équitable pour tous.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-medium text-lg px-8 py-6 w-full sm:w-auto">
                    Commencer gratuitement
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <a href="#fonctionnement">
                  <Button size="lg" variant="outline" className="border-2 border-primary text-foreground hover:bg-primary/10 text-lg px-8 py-6 w-full sm:w-auto">
                    Comment ça marche
                  </Button>
                </a>
              </div>

              {/* Stats rapides */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">500+</div>
                  <div className="text-sm text-muted-foreground">Créateurs</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary">200+</div>
                  <div className="text-sm text-muted-foreground">Marques</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">1000+</div>
                  <div className="text-sm text-muted-foreground">Collaborations</div>
                </div>
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
                        <div className="font-bold text-foreground">Marque Tech</div>
                        <div className="text-sm text-muted-foreground">Recherche créateurs</div>
                      </div>
                    </div>
                    <p className="text-sm text-foreground/80">Budget 1000-2000€ pour campagne produit</p>
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
                        <div className="font-bold text-foreground">Créateur Tech</div>
                        <div className="text-sm text-muted-foreground">50K abonnés</div>
                      </div>
                    </div>
                    <p className="text-sm text-foreground/80">Spécialisé en reviews et unboxing</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      
      {/* Section Valeur Ajoutée */}
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
              La mise en relation simplifiée
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Nous éliminons les intermédiaires et facilitons les connexions authentiques 
              entre marques et créateurs de contenu.
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
              <h3 className="text-2xl font-bold text-foreground mb-4">Rapide</h3>
              <p className="text-muted-foreground leading-relaxed">
                Trouvez des partenaires en quelques clics. Notre algorithme intelligent 
                vous met en relation avec les bons profils instantanément.
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
              <h3 className="text-2xl font-bold text-foreground mb-4">Sécurisé</h3>
              <p className="text-muted-foreground leading-relaxed">
                Profils vérifiés, paiements sécurisés et contrats standardisés. 
                Collaborez en toute confiance.
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
              <h3 className="text-2xl font-bold text-foreground mb-4">Équitable</h3>
              <p className="text-muted-foreground leading-relaxed">
                Transparence totale sur les tarifs. Les créateurs gardent plus, 
                les marques paient moins.
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
              <h3 className="text-2xl font-bold text-foreground mb-4">Inscription</h3>
              <p className="text-muted-foreground leading-relaxed">
                Créez votre profil en quelques clics, que vous soyez une marque ou un créateur.
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
              <h3 className="text-2xl font-bold text-foreground mb-4">Match</h3>
              <p className="text-muted-foreground leading-relaxed">
                Découvrez les profils qui correspondent à vos besoins grâce à notre algorithme.
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
              <h3 className="text-2xl font-bold text-foreground mb-4">Collaboration</h3>
              <p className="text-muted-foreground leading-relaxed">
                Entrez en contact, discutez de vos projets et lancez des partenariats uniques.
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
              Gagnez en visibilité, développez votre réseau et boostez votre chiffre d'affaires.
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
                  <CheckCircle className="h-6 w-6 text-primary" />
                  <p className="text-muted-foreground leading-relaxed">
                    Accédez à un vivier de créateurs talentueux et pertinents pour votre marque.
                  </p>
                </li>
                <li className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-primary" />
                  <p className="text-muted-foreground leading-relaxed">
                    Gérez facilement vos campagnes de partenariats de A à Z.
                  </p>
                </li>
                <li className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-primary" />
                  <p className="text-muted-foreground leading-relaxed">
                    Mesurez l'impact de vos collaborations grâce à des statistiques détaillées.
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
                  <CheckCircle className="h-6 w-6 text-secondary" />
                  <p className="text-muted-foreground leading-relaxed">
                    Trouvez des marques qui correspondent à votre univers et à vos valeurs.
                  </p>
                </li>
                <li className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-secondary" />
                  <p className="text-muted-foreground leading-relaxed">
                    Monétisez votre talent et développez votre communauté.
                  </p>
                </li>
                <li className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-secondary" />
                  <p className="text-muted-foreground leading-relaxed">
                    Simplifiez la gestion de vos partenariats et recevez des paiements sécurisés.
                  </p>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section Exemples */}
      <section id="exemples" className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full mb-4">
              <Briefcase className="h-5 w-5 text-secondary" />
              <span className="text-sm font-semibold text-foreground">Exemples</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Découvrez des exemples de collaborations
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Voici quelques opportunités et pitchs disponibles sur Partnery
            </p>
          </motion.div>

          {/* Exemples Marques */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-center mb-8 text-foreground">Opportunités de marques</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { emoji: "💡", title: "Lumos Wear", desc: "Recherche créateurs lifestyle pour lancer une nouvelle veste LED" },
                { emoji: "🌱", title: "EcoSip", desc: "Partenariats micro-influenceurs pour campagne zéro plastique" },
                { emoji: "✨", title: "NovaSkincare", desc: "Budget 500–1500€ pour UGC autour d'une routine peau sensible" },
                { emoji: "🎧", title: "UrbanBeats Audio", desc: "Cherche créateurs tech pour tester le casque UB-One" }
              ].map((brand, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-background rounded-3xl p-6 border-2 border-primary/20 hover:border-primary/40 transition-all hover:shadow-soft"
                >
                  <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl mb-4 flex items-center justify-center">
                    <span className="text-5xl">{brand.emoji}</span>
                  </div>
                  <h4 className="text-xl font-bold text-foreground mb-2">{brand.title}</h4>
                  <p className="text-sm text-muted-foreground">{brand.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Exemples Créateurs */}
          <div>
            <h3 className="text-2xl font-bold text-center mb-8 text-foreground">Pitchs de créateurs</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { emoji: "💪", title: "EmmaFit", desc: "Créatrice fitness ouverte aux marques bien-être et équipement" },
                { emoji: "📱", title: "TechByLeo", desc: "Micro-influenceur tech spécialisé en vidéos courtes" },
                { emoji: "🍽️", title: "SarahEats", desc: "Créatrice food pour contenus recettes simples & healthy" },
                { emoji: "✈️", title: "JulesRoadTrip", desc: "Créateur voyage spécialisé drone & exploration urbaine" }
              ].map((creator, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-background rounded-3xl p-6 border-2 border-secondary/20 hover:border-secondary/40 transition-all hover:shadow-soft"
                >
                  <div className="w-full h-32 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-2xl mb-4 flex items-center justify-center">
                    <span className="text-5xl">{creator.emoji}</span>
                  </div>
                  <h4 className="text-xl font-bold text-foreground mb-2">{creator.title}</h4>
                  <p className="text-sm text-muted-foreground">{creator.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section Preuve Sociale */}
      <section className="py-24 px-4 bg-card">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-foreground">Chiffres clés</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Partnery en quelques chiffres
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Des résultats concrets pour nos utilisateurs.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { value: "1000+", label: "Collaborations réussies", color: "text-primary" },
              { value: "500+", label: "Créateurs de contenu", color: "text-secondary" },
              { value: "200+", label: "Marques partenaires", color: "text-foreground" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className={`text-5xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                <p className="text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
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
              <span className="text-sm font-semibold text-foreground">Pourquoi nous ?</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              La plateforme idéale pour vos partenariats
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Une solution complète, simple et efficace pour développer votre activité.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            {[
              { icon: Zap, title: "Gain de temps", desc: "Trouvez rapidement les partenaires adaptés à vos besoins.", color: "primary" },
              { icon: Shield, title: "Sécurité", desc: "Collaborez en toute confiance grâce à nos outils de protection.", color: "secondary" },
              { icon: Heart, title: "Simplicité", desc: "Gérez facilement vos partenariats de A à Z.", color: "primary" },
              { icon: Users, title: "Communauté", desc: "Rejoignez un réseau de professionnels passionnés.", color: "secondary" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex items-start gap-6"
              >
                <div className={`w-16 h-16 bg-${item.color}/20 rounded-2xl flex items-center justify-center`}>
                  <item.icon className={`h-8 w-8 text-${item.color}`} />
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
                Commencer maintenant
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
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
                La plateforme qui connecte marques et créateurs pour des collaborations réussies.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Plateforme</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="#valeur" className="hover:text-primary transition-colors">Valeur ajoutée</a></li>
                <li><a href="#fonctionnement" className="hover:text-primary transition-colors">Comment ça marche</a></li>
                <li><a href="#benefices" className="hover:text-primary transition-colors">Bénéfices</a></li>
                <li><a href="#exemples" className="hover:text-primary transition-colors">Exemples</a></li>
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
                  Commencer
                </Button>
              </Link>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-white/60">© 2024 Partnery. Tous droits réservés.</p>
              <div className="flex gap-6 text-sm text-white/60">
                <a href="#" className="hover:text-primary transition-colors">Mentions légales</a>
                <a href="#" className="hover:text-primary transition-colors">CGU</a>
                <a href="#" className="hover:text-primary transition-colors">Confidentialité</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
