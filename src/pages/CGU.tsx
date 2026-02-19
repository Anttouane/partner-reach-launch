import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import SEOHead from "@/components/SEOHead";

const CGU = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Conditions Générales d'Utilisation | Partnery" description="Consultez les conditions générales d'utilisation de Partnery : inscription, services, commission de 5%, obligations et paiements." />
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
        <h1 className="text-4xl font-bold text-foreground mb-2">Conditions Générales d'Utilisation</h1>
        <p className="text-muted-foreground mb-8">Dernière mise à jour : février 2026</p>

        <Card>
          <CardContent className="pt-6">
            <Accordion type="multiple" defaultValue={["objet"]}>
              <AccordionItem value="objet">
                <AccordionTrigger className="text-lg font-semibold">1. Objet et acceptation</AccordionTrigger>
                <AccordionContent className="space-y-3 text-muted-foreground">
                  <p>Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme Partnery, accessible à l'adresse partnery.app.</p>
                  <p>Partnery est une plateforme de mise en relation directe entre marques et créateurs de contenu, permettant la création de partenariats sans intermédiaire.</p>
                  <p>L'inscription et l'utilisation de la plateforme impliquent l'acceptation pleine et entière des présentes CGU. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser la plateforme.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="inscription">
                <AccordionTrigger className="text-lg font-semibold">2. Inscription et comptes utilisateurs</AccordionTrigger>
                <AccordionContent className="space-y-3 text-muted-foreground">
                  <p>Pour utiliser Partnery, vous devez créer un compte en fournissant des informations exactes et à jour. Deux types de comptes sont disponibles :</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong className="text-foreground">Compte Créateur :</strong> pour les créateurs de contenu souhaitant proposer leurs services aux marques.</li>
                    <li><strong className="text-foreground">Compte Marque :</strong> pour les entreprises et marques recherchant des créateurs pour leurs campagnes.</li>
                  </ul>
                  <p>Vous êtes responsable de la confidentialité de vos identifiants de connexion et de toute activité réalisée sous votre compte.</p>
                  <p>Partnery se réserve le droit de suspendre ou supprimer tout compte en cas de violation des présentes CGU.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="services">
                <AccordionTrigger className="text-lg font-semibold">3. Description des services</AccordionTrigger>
                <AccordionContent className="space-y-3 text-muted-foreground">
                  <p>Partnery propose les services suivants :</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong className="text-foreground">Découverte :</strong> parcourir les pitchs de créateurs et les opportunités de marques.</li>
                    <li><strong className="text-foreground">Messagerie intégrée :</strong> communiquer directement avec des partenaires potentiels.</li>
                    <li><strong className="text-foreground">Contrats collaboratifs :</strong> créer, négocier et signer des contrats en ligne.</li>
                    <li><strong className="text-foreground">Paiements sécurisés :</strong> effectuer et recevoir des paiements via Stripe.</li>
                    <li><strong className="text-foreground">Tableau de bord :</strong> suivre ses statistiques et performances.</li>
                  </ul>
                  <p>Partnery agit en tant qu'intermédiaire technique et n'est pas partie aux contrats conclus entre marques et créateurs.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="commission">
                <AccordionTrigger className="text-lg font-semibold">4. Modèle économique et commission</AccordionTrigger>
                <AccordionContent className="space-y-3 text-muted-foreground">
                  <p><strong className="text-foreground">L'inscription et l'utilisation de Partnery sont 100% gratuites.</strong> Il n'y a aucun abonnement ni frais d'inscription.</p>
                  <p>Partnery perçoit une <strong className="text-foreground">commission de 5%</strong> sur chaque transaction réussie entre une marque et un créateur. Cette commission est prélevée automatiquement lors du paiement.</p>
                  <p><strong className="text-foreground">Exemple :</strong> pour un contrat de 1 000 €, la marque paie 1 000 €. Partnery prélève 50 € (5%) et le créateur reçoit 950 €.</p>
                  <p>Des frais de traitement bancaire (Stripe) peuvent s'appliquer en sus et sont indiqués de manière transparente lors de chaque transaction.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="obligations">
                <AccordionTrigger className="text-lg font-semibold">5. Obligations des utilisateurs</AccordionTrigger>
                <AccordionContent className="space-y-3 text-muted-foreground">
                  <p><strong className="text-foreground">Tous les utilisateurs s'engagent à :</strong></p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Fournir des informations exactes et à jour sur leur profil.</li>
                    <li>Respecter les lois et réglementations en vigueur.</li>
                    <li>Ne pas publier de contenu illicite, diffamatoire ou trompeur.</li>
                    <li>Respecter les engagements pris dans les contrats signés sur la plateforme.</li>
                    <li>Ne pas contourner le système de paiement de Partnery.</li>
                  </ul>
                  <p><strong className="text-foreground">Les marques s'engagent également à :</strong></p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Payer les créateurs dans les délais convenus.</li>
                    <li>Fournir des briefs clairs et complets.</li>
                  </ul>
                  <p><strong className="text-foreground">Les créateurs s'engagent également à :</strong></p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Livrer les contenus conformément aux contrats signés.</li>
                    <li>Respecter les délais convenus.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="paiements">
                <AccordionTrigger className="text-lg font-semibold">6. Contrats et paiements</AccordionTrigger>
                <AccordionContent className="space-y-3 text-muted-foreground">
                  <p>Les contrats créés sur Partnery engagent les parties (marque et créateur). Partnery fournit les outils de création et de signature mais n'est pas partie au contrat.</p>
                  <p>Les paiements sont traités de manière sécurisée via Stripe. Les fonds sont libérés au créateur après validation du livrable par la marque.</p>
                  <p>En cas de litige, les parties peuvent solliciter la médiation de Partnery via le système de gestion des litiges intégré.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="responsabilite">
                <AccordionTrigger className="text-lg font-semibold">7. Responsabilité de la plateforme</AccordionTrigger>
                <AccordionContent className="space-y-3 text-muted-foreground">
                  <p>Partnery met tout en œuvre pour assurer la disponibilité et la sécurité de la plateforme, sans toutefois garantir une disponibilité ininterrompue.</p>
                  <p>Partnery ne peut être tenu responsable :</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>De la qualité des contenus publiés par les utilisateurs.</li>
                    <li>De l'exécution des contrats entre marques et créateurs.</li>
                    <li>Des dommages résultant de l'utilisation ou de l'impossibilité d'utiliser la plateforme.</li>
                    <li>Des interruptions temporaires pour maintenance.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="resiliation">
                <AccordionTrigger className="text-lg font-semibold">8. Résiliation et suppression de compte</AccordionTrigger>
                <AccordionContent className="space-y-3 text-muted-foreground">
                  <p>Vous pouvez supprimer votre compte à tout moment en contactant notre support à contact@partnery.app.</p>
                  <p>La suppression du compte entraîne la suppression de vos données personnelles, sous réserve des obligations légales de conservation (notamment comptables).</p>
                  <p>Les contrats en cours doivent être honorés avant la suppression du compte.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="modification">
                <AccordionTrigger className="text-lg font-semibold">9. Modification des CGU</AccordionTrigger>
                <AccordionContent className="space-y-3 text-muted-foreground">
                  <p>Partnery se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification substantielle par email ou notification sur la plateforme.</p>
                  <p>La poursuite de l'utilisation de la plateforme après modification vaut acceptation des nouvelles CGU.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="droit">
                <AccordionTrigger className="text-lg font-semibold">10. Droit applicable et juridiction</AccordionTrigger>
                <AccordionContent className="space-y-3 text-muted-foreground">
                  <p>Les présentes CGU sont régies par le droit français.</p>
                  <p>En cas de litige, les parties s'efforceront de trouver une solution amiable. À défaut, les tribunaux compétents seront ceux du ressort du siège social de Partnery.</p>
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

export default CGU;
