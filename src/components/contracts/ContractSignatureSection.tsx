import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, Pen, Lock, AlertTriangle } from 'lucide-react';
import { Contract } from '@/types/contract';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ContractSignatureSectionProps {
  contract: Contract;
  currentUserId: string;
  isBrand: boolean;
  onSign: () => Promise<void>;
}

export function ContractSignatureSection({
  contract,
  currentUserId,
  isBrand,
  onSign,
}: ContractSignatureSectionProps) {
  const [signing, setSigning] = useState(false);

  const brandSigned = contract.brand_signed_at !== null;
  const creatorSigned = contract.creator_signed_at !== null;
  const bothSigned = brandSigned && creatorSigned;
  const canSign = contract.status === 'ready_to_sign' || 
    (contract.status === 'signed' && ((isBrand && !brandSigned) || (!isBrand && !creatorSigned)));

  const handleSign = async () => {
    setSigning(true);
    await onSign();
    setSigning(false);
  };

  const currentUserSigned = isBrand ? brandSigned : creatorSigned;
  const otherPartySigned = isBrand ? creatorSigned : brandSigned;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Pen className="h-5 w-5" />
          F. Signatures
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Brand Signature */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Marque</h4>
              {brandSigned ? (
                <Badge className="bg-green-100 text-green-800">
                  <Check className="h-3 w-3 mr-1" />
                  Signé
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  En attente
                </Badge>
              )}
            </div>
            {brandSigned ? (
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Signé le {format(new Date(contract.brand_signed_at!), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}</p>
                <p className="text-xs">IP: {contract.brand_signature_ip}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Signature en attente</p>
            )}
            {isBrand && !brandSigned && canSign && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="w-full mt-3" disabled={signing}>
                    <Pen className="h-4 w-4 mr-2" />
                    Signer le contrat
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmer la signature</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                      <p>En signant ce contrat, vous vous engagez légalement à respecter les termes définis.</p>
                      <p className="flex items-center gap-2 text-orange-600">
                        <AlertTriangle className="h-4 w-4" />
                        Cette action est irréversible.
                      </p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSign} disabled={signing}>
                      Je confirme ma signature
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          {/* Creator Signature */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Créateur</h4>
              {creatorSigned ? (
                <Badge className="bg-green-100 text-green-800">
                  <Check className="h-3 w-3 mr-1" />
                  Signé
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  En attente
                </Badge>
              )}
            </div>
            {creatorSigned ? (
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Signé le {format(new Date(contract.creator_signed_at!), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}</p>
                <p className="text-xs">IP: {contract.creator_signature_ip}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Signature en attente</p>
            )}
            {!isBrand && !creatorSigned && canSign && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="w-full mt-3" disabled={signing}>
                    <Pen className="h-4 w-4 mr-2" />
                    Signer le contrat
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmer la signature</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                      <p>En signant ce contrat, vous vous engagez légalement à respecter les termes définis.</p>
                      <p className="flex items-center gap-2 text-orange-600">
                        <AlertTriangle className="h-4 w-4" />
                        Cette action est irréversible.
                      </p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSign} disabled={signing}>
                      Je confirme ma signature
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {bothSigned && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 rounded-lg flex items-center gap-3">
            <Lock className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800 dark:text-green-200">Contrat signé et verrouillé</p>
              <p className="text-sm text-green-600 dark:text-green-300">
                Les deux parties ont signé. Le contrat est maintenant en lecture seule.
              </p>
            </div>
          </div>
        )}

        {!canSign && !bothSigned && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Le contrat doit être approuvé par les deux parties avant de pouvoir être signé.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
