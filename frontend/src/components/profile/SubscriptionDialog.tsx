import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useSubscribeToPro } from '@/hooks/profile/useSubscribeToPro';

interface SubscriptionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubscriptionSuccess: () => void;
}

const SubscriptionDialog: React.FC<SubscriptionDialogProps> = ({
  isOpen,
  onOpenChange,
  onSubscriptionSuccess,
}) => {
  const { mutate: subscribe, isPending, error } = useSubscribeToPro();

  const handleSubscribe = () => {
    subscribe(undefined, {
      onSuccess: () => {
        toast.success('Abonnement erfolgreich aktiviert!');
        onSubscriptionSuccess();
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Star className="mr-2 h-5 w-5 text-yellow-500 fill-yellow-400" />
            GroupMeet Pro
          </DialogTitle>
          <DialogDescription>
            Schalten Sie Premium-Funktionen frei und unterstützen Sie GroupMeet!
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <p className="text-sm text-muted-foreground">Mit GroupMeet Pro erhalten Sie:</p>
          <ul className="list-none space-y-2 text-sm">
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Unbegrenzte Freunde:</strong> Knüpfen Sie so viele Kontakte, wie Sie
                möchten.
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Unbegrenzte Meeting-Erstellungen:</strong> Planen Sie Meetings ohne
                wöchentliche Limits.
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>
                <strong>An unbegrenzt vielen Meetings teilnehmen:</strong> Nehmen Sie an so vielen
                aktiven Meetings teil, wie Sie möchten.
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Pro-Abzeichen:</strong> Zeigen Sie Ihren Pro-Status auf Ihrem Profil.
                (Demnächst!)
              </span>
            </li>
          </ul>
          <div className="pt-4 text-center">
            <p className="text-2xl font-bold text-foreground">Nur 5,00€</p>
            <p className="text-xs text-muted-foreground">pro Monat (simuliert)</p>
          </div>
        </div>

        {error && <p className="text-sm text-destructive text-center mb-2">{error.message}</p>}

        <DialogFooter className="sm:justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Schließen
          </Button>
          <Button type="button" onClick={handleSubscribe} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird verarbeitet...
              </>
            ) : (
              <>
                <Star className="mr-2 h-4 w-4" /> Jetzt Pro werden
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionDialog;
