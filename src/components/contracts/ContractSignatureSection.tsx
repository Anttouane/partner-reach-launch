import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, Pen, Lock, AlertTriangle, CheckCircle2 } from 'lucide-react';
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

  const SignatureBox = ({ label, signed, signedAt, signatureIp, canUserSign, onSignClick }: {
    label: string;
    signed: boolean;
    signedAt: string | null;
    signatureIp: string | null;
    canUserSign: boolean;
    onSignClick: () => void;
  }) => (
    <div className={`rounded-xl border-2 p-5 transition-all ${
      signed 
        ? 'border-green-300 dark:border-green-700 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/30' 
        : 'border-border/50 bg-muted/20'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold">{label}</h4>
        {signed ? (
          <div className="flex items-center gap-1.5 text-green-700 dark:text-green-300">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-semibold">Signé</span>
          </div>
        ) : (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            En attente
          </Badge>
        )}
      </div>

      {signed && signedAt ? (
        <div className="text-sm text-muted-foreground space-y-1">
          <p>Signé le {format(new Date(signedAt), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}</p>
          {signatureIp && <p className="text-xs opacity-70">IP: {signatureIp}</p>}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Signature en attente</p>
      )}

      {canUserSign && !signed && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-full mt-4" size="lg" disabled={signing}>
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
              <AlertDialogAction onClick={onSignClick} disabled={signing}>
                Je confirme ma signature
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );

  return (
    <Card className="mb-5 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-muted/40 to-transparent border-b border-border/40">
        <CardTitle className="text-base font-semibold flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Pen className="h-5 w-5 text-primary" />
            </div>
            <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-md bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shadow-sm">
              F
            </span>
          </div>
          <span>Signatures</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <SignatureBox
            label="Marque"
            signed={brandSigned}
            signedAt={contract.brand_signed_at}
            signatureIp={contract.brand_signature_ip}
            canUserSign={isBrand && canSign}
            onSignClick={handleSign}
          />
          <SignatureBox
            label="Créateur"
            signed={creatorSigned}
            signedAt={contract.creator_signed_at}
            signatureIp={contract.creator_signature_ip}
            canUserSign={!isBrand && canSign}
            onSignClick={handleSign}
          />
        </div>

        {bothSigned && (
          <div className="mt-5 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/30 rounded-xl border border-green-200 dark:border-green-800 flex items-center gap-3">
            <Lock className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-semibold text-green-800 dark:text-green-200">Contrat signé et verrouillé</p>
              <p className="text-sm text-green-600 dark:text-green-300">
                Les deux parties ont signé. Le contrat est maintenant en lecture seule.
              </p>
            </div>
          </div>
        )}

        {!canSign && !bothSigned && (
          <div className="mt-5 p-4 bg-muted/50 rounded-xl border border-border/40">
            <p className="text-sm text-muted-foreground">
              Le contrat doit être approuvé par les deux parties avant de pouvoir être signé.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
