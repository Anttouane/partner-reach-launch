import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const PolitiqueConfidentialite = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Partnery</span>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-4xl font-bold text-foreground mb-2">Politique de Confidentialité</h1>
        <p className="text-muted-foreground mb-8">Dernière mise à jour : février 2026</p>

        <Card>
          <CardContent className="pt-6">
            <Accordion type="multiple" defaultValue={["collecte"]}>
              <AccordionItem value="collecte">
                <AccordionTrigger className="text-lg font-semibold">1. Données collectées</AccordionTrigger>
                <AccordionContent className="space-y-3 text-muted-foreground">
                  <p>Dans le cadre de votre utilisation de Partnery, nous collectons les données suivantes :</p>
                  <p><strong className="text-foreground">Données d'inscription :</strong></p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Adresse email</li>
                    <li>Nom complet</li>
                    <li>Type de profil (créateur ou marque)</li>
                  </ul>
                  <p><strong className="text-foreground">Données de profil :</strong></p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Photo de profil, biographie</li>
                    <li>Liens vers les réseaux sociaux (Instagram, TikTok, YouTube, etc.)</li>
                    <li>Portfolio (pour les créateurs)</li>
                    <li>Informations d'entreprise (pour les marques)</li>
                  </ul>
                  <p><strong className="text-foreground">Données transactionnelles :</strong></p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Historique des paiements et commissions</li>
                    <li>IBAN (pour les retraits)</li>
                    <li>Contrats signés</li>
                  </ul>
                  <p><strong className="text-foreground">Données de navigation :</strong></p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Adresse IP, type de navigateur</li>
                    <li>Pages consultées, durée des sessions</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="finalite">
                <AccordionTrigger className="text-lg font-semibold">2. Finalité du traitement</AccordionTrigger>
                <AccordionContent className="space-y-3 text-muted-foreground">
                  <p>Vos données sont utilisées pour :</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Gérer votre compte et votre profil sur la plateforme.</li>
                    <li>Faciliter la mise en relation entre marques et créateurs.</li>
                    <li>Traiter les paiements et la commission de 5%.</li>
                    <li>Générer et gérer les contrats entre utilisateurs.</li>
                    <li>Assurer la sécurité et prévenir la fraude.</li>
                    <li>Améliorer nos services et l'expérience utilisateur.</li>
                    <li>Communiquer avec vous (notifications, support).</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="base-legale">
                <AccordionTrigger className="text-lg font-semibold">3. Base légale (RGPD)</AccordionTrigger>
                <AccordionContent className="space-y-3 text-muted-foreground">
                  <p>Conformément au Règlement Général sur la Protection des Données (RGPD), le traitement de vos données repose sur :</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong className="text-foreground">L'exécution du contrat :</strong> traitement nécessaire à la fourniture de nos services (article 6.1.b).</li>
                    <li><strong className="text-foreground">Le consentement :</strong> pour les cookies non essentiels et les communications marketing (article 6.1.a).</li>
                    <li><strong className="text-foreground">L'intérêt légitime :</strong> pour la sécurité de la plateforme et l'amélioration des services (article 6.1.f).</li>
                    <li><strong className="text-foreground">L'obligation légale :</strong> pour la conservation des données comptables et fiscales (article 6.1.c).</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="conservation">
                <AccordionTrigger className="text-lg font-semibold">4. Durée de conservation</AccordionTrigger>
                <AccordionContent className="space-y-3 text-muted-foreground">
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong className="text-foreground">Données de compte :</strong> conservées pendant toute la durée d'activité du compte, puis 3 ans après sa suppression.</li>
                    <li><strong className="text-foreground">Données transactionnelles :</strong> conservées 10 ans conformément aux obligations comptables.</li>
                    <li><strong className="text-foreground">Données de navigation :</strong> conservées 13 mois maximum.</li>
                    <li><strong className="text-foreground">Messages :</strong> conservés pendant la durée d'activité du compte.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="droits">
                <AccordionTrigger className="text-lg font-semibold">5. Vos droits</AccordionTrigger>
                <AccordionContent className="space-y-3 text-muted-foreground">
                  <p>Conformément au RGPD, vous disposez des droits suivants :</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong className="text-foreground">Droit d'accès :</strong> obtenir une copie de vos données personnelles.</li>
                    <li><strong className="text-foreground">Droit de rectification :</strong> corriger vos données inexactes ou incomplètes.</li>
                    <li><strong className="text-foreground">Droit à l'effacement :</strong> demander la suppression de vos données.</li>
                    <li><strong className="text-foreground">Droit à la portabilité :</strong> recevoir vos données dans un format structuré.</li>
                    <li><strong className="text-foreground">Droit d'opposition :</strong> vous opposer au traitement de vos données.</li>
                    <li><strong className="text-foreground">Droit à la limitation :</strong> demander la limitation du traitement.</li>
                  </ul>
                  <p>Pour exercer ces droits, contactez-nous à <a href="mailto:contact@partnery.app" className="text-primary hover:underline">contact@partnery.app</a>. Nous répondrons dans un délai de 30 jours.</p>
                  <p>Vous pouvez également déposer une réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.cnil.fr</a></p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="cookies">
                <AccordionTrigger className="text-lg font-semibold">6. Cookies</AccordionTrigger>
                <AccordionContent className="space-y-3 text-muted-foreground">
                  <p>Partnery utilise des cookies pour :</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong className="text-foreground">Cookies essentiels :</strong> nécessaires au fonctionnement du site (authentification, sécurité).</li>
                    <li><strong className="text-foreground">Cookies analytiques :</strong> mesurer l'audience et améliorer le site (avec votre consentement).</li>
                  </ul>
                  <p>Vous pouvez gérer vos préférences de cookies via les paramètres de votre navigateur.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="partage">
                <AccordionTrigger className="text-lg font-semibold">7. Partage des données</AccordionTrigger>
                <AccordionContent className="space-y-3 text-muted-foreground">
                  <p>Vos données peuvent être partagées avec :</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong className="text-foreground">Stripe :</strong> pour le traitement sécurisé des paiements.</li>
                    <li><strong className="text-foreground">Les autres utilisateurs :</strong> les informations de votre profil public sont visibles par les autres membres de la plateforme.</li>
                  </ul>
                  <p>Nous ne vendons jamais vos données personnelles à des tiers.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="dpo">
                <AccordionTrigger className="text-lg font-semibold">8. Contact DPO</AccordionTrigger>
                <AccordionContent className="space-y-3 text-muted-foreground">
                  <p>Pour toute question relative à la protection de vos données personnelles, vous pouvez contacter notre Délégué à la Protection des Données (DPO) :</p>
                  <p><strong className="text-foreground">Email :</strong> <a href="mailto:contact@partnery.app" className="text-primary hover:underline">contact@partnery.app</a></p>
                  <p><strong className="text-foreground">Objet :</strong> Demande DPO - [votre demande]</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Pour toute question, contactez-nous à <a href="mailto:contact@partnery.app" className="text-primary hover:underline">contact@partnery.app</a>
          </p>
        </div>
      </main>
    </div>
  );
};

export default PolitiqueConfidentialite;
