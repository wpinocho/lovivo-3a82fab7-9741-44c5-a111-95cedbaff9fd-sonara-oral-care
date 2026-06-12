import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isValidPhone } from "@/lib/phone-utils";

interface MissingPhoneDialogProps {
  open: boolean;
  /** Optional initial value pre-filled in the input. */
  defaultValue?: string;
  /** Called with the captured phone (raw, as typed). Parent should normalize. */
  onSubmit: (phone: string) => void;
  /** Called when the user cancels. Parent must abort the payment flow. */
  onCancel: () => void;
}

/**
 * Shopify-style fallback dialog: shown ONLY when a wallet (Google Pay typically)
 * does not deliver the phone number. Asks the user for the phone before the
 * payment intent is created/confirmed.
 *
 * Used by:
 *  - StripePayment.handleExpressCheckoutConfirm (/pagar)
 *  - ProductExpressCheckout.handlePaymentMethod (PDP)
 */
export function MissingPhoneDialog({ open, defaultValue, onSubmit, onCancel }: MissingPhoneDialogProps) {
  const [value, setValue] = useState(defaultValue || "");
  const [touched, setTouched] = useState(false);

  // Reset internal state every time the dialog reopens.
  useEffect(() => {
    if (open) {
      setValue(defaultValue || "");
      setTouched(false);
    }
  }, [open, defaultValue]);

  const valid = isValidPhone(value);
  const showError = touched && !valid;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setTouched(true);
    if (!valid) return;
    onSubmit(value.trim());
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Closing the dialog (X / overlay / Esc) cancels the payment flow.
        if (!next) onCancel();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Necesitamos tu teléfono</DialogTitle>
          <DialogDescription>
            Lo usaremos para coordinar el envío de tu pedido. Tu pago no se completará hasta que lo agregues.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-2">
          <Label htmlFor="missing-phone-input">Teléfono de contacto</Label>
          <Input
            id="missing-phone-input"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            autoFocus
            placeholder="55 1234 5678"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => setTouched(true)}
            aria-invalid={showError}
          />
          {showError && (
            <p className="text-sm text-destructive">Ingresa un teléfono válido (7 a 15 dígitos).</p>
          )}
        </form>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={() => handleSubmit()} disabled={!valid}>
            Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default MissingPhoneDialog;
