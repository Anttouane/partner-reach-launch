import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const MentionsLegales = () => {
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
        <h1 className="text-4xl font-bold text-foreground mb-2">Mentions Légales</h1>
        <p className="text-muted-foreground mb-8">Dernière mise à jour : février 2026</p>

        <Card>
          <CardContent className="pt-6">
            <Accordion type="multiple" defaultValue={["editeur", "hebergeur", "directeur", "propriete"]}>
              <AccordionItem value="editeur">
                <AccordionTrigger className="text-lg font-semibold">Éditeur du site</AccordionTrigger>
                <AccordionContent className="space-y-2 text-muted-foreground">
                  <p><strong className="text-foreground">Nom :</strong> Partnery</p>
                  <p><strong className="text-foreground">Forme juridique :</strong> [À compléter]</p>
                  <p><strong className="text-foreground">Siège social :</strong> [À compléter]</p>
                  <p><strong className="text-foreground">SIRET :</strong> [À compléter]</p>
                  <p><strong className="text-foreground">Email :</strong> contact@partnery.app</p>
                  <p><strong className="text-foreground">Téléphone :</strong> [À compléter]</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="hebergeur">
                <AccordionTrigger className="text-lg font-semibold">Hébergeur</AccordionTrigger>
                <AccordionContent className="space-y-2 text-muted-foreground">
                  <p>Le site Partnery est hébergé par :</p>
                  <p><strong className="text-foreground">Lovable (Lovable Cloud)</strong></p>
                  <p>Infrastructure fournie par des services cloud conformes aux normes européennes de protection des données.</p>
                  <p>Les données sont stockées sur des serveurs sécurisés avec chiffrement des données au repos et en transit.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="directeur">
                <AccordionTrigger className="text-lg font-semibold">Directeur de la publication</AccordionTrigger>
                <AccordionContent className="space-y-2 text-muted-foreground">
                  <p><strong className="text-foreground">Directeur de la publication :</strong> [À compléter]</p>
                  <p>Le directeur de la publication est responsable du contenu éditorial publié sur la plateforme Partnery.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="propriete">
                <AccordionTrigger className="text-lg font-semibold">Propriété intellectuelle</AccordionTrigger>
                <AccordionContent className="space-y-2 text-muted-foreground">
                  <p>L'ensemble du contenu du site Partnery (textes, images, logos, graphismes, icônes, logiciels, base de données) est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.</p>
                  <p>Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments du site est interdite sans autorisation écrite préalable de Partnery.</p>
                  <p>La marque « Partnery » et son logo sont des marques déposées. Toute utilisation non autorisée constitue une contrefaçon sanctionnée par le Code de la propriété intellectuelle.</p>
                  <p>Les contenus publiés par les utilisateurs (pitchs, descriptions, portfolios) restent la propriété de leurs auteurs respectifs. En publiant sur Partnery, les utilisateurs accordent une licence non exclusive d'utilisation pour l'affichage sur la plateforme.</p>
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

export default MentionsLegales;
