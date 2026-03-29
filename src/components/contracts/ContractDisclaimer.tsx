import { ShieldAlert } from 'lucide-react';

export function ContractDisclaimer() {
  return (
    <div className="mb-6 rounded-xl border-2 border-orange-200 dark:border-orange-800/50 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20 p-5">
      <div className="flex gap-4">
        <div className="shrink-0 h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
          <ShieldAlert className="h-5 w-5 text-orange-600 dark:text-orange-400" />
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-orange-900 dark:text-orange-200">
            Avertissement — Outil de simplification
          </h4>
          <ul className="space-y-1.5 text-xs text-orange-800/80 dark:text-orange-300/80 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-400 shrink-0" />
              Partnery met à disposition cet outil pour <strong className="text-orange-900 dark:text-orange-200">simplifier vos collaborations</strong> entre créateurs et marques.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-400 shrink-0" />
              Partnery <strong className="text-orange-900 dark:text-orange-200">n'est en aucun cas responsable</strong> du contenu, de l'exécution ou du respect des contrats générés.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-400 shrink-0" />
              Ce service <strong className="text-orange-900 dark:text-orange-200">ne constitue pas un conseil juridique</strong>. Consultez un professionnel du droit pour toute question légale.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
