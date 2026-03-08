import { Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ContractDisclaimer() {
  return (
    <Alert className="border-primary/30 bg-primary/5 mb-6">
      <Info className="h-4 w-4 text-primary" />
      <AlertDescription className="text-xs text-muted-foreground leading-relaxed">
        <strong className="text-foreground">Avertissement :</strong> Partnery met à disposition cet outil de contrat pour simplifier vos collaborations entre créateurs et marques. 
        Partnery n'est en aucun cas responsable du contenu, de l'exécution ou du respect des contrats générés via la plateforme. 
        Ce service ne constitue pas un conseil juridique. Pour toute question légale, consultez un professionnel du droit.
      </AlertDescription>
    </Alert>
  );
}
