import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDateRange } from "@/lib/utils";

export interface BookingSummaryProps {
  title: string;
  startDate: Date;
  endDate: Date;
  numberOfGuests: number;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
}

/**
 * Read-only price breakdown shown in the booking wizard's review step and
 * on a booking's detail page. Pure display component — it doesn't compute
 * pricing itself, that's `booking.service.ts`'s job; this only formats
 * numbers it's given.
 */
export function BookingSummary({
  title,
  startDate,
  endDate,
  numberOfGuests,
  subtotal,
  discountAmount,
  taxAmount,
  totalAmount,
  currency,
}: BookingSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {formatDateRange(startDate, endDate)} · {numberOfGuests}{" "}
          {numberOfGuests === 1 ? "guest" : "guests"}
        </p>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatCurrency(subtotal, currency)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-emerald-600">
            <span>Discount</span>
            <span>-{formatCurrency(discountAmount, currency)}</span>
          </div>
        )}
        {taxAmount > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Taxes</span>
            <span>{formatCurrency(taxAmount, currency)}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4 text-base font-semibold">
        <span>Total</span>
        <span>{formatCurrency(totalAmount, currency)}</span>
      </CardFooter>
    </Card>
  );
}
