import { Badge } from "@/components/ui/badge";

type ListingType = "FOR_SALE" | "FREE" | "EXCHANGE";

interface PriceTagProps {
  price: number | null;
  listingType: ListingType;
  className?: string;
}

export function PriceTag({ price, listingType, className }: PriceTagProps) {
  if (listingType === "FREE") {
    return (
      <Badge variant="success" className={`text-sm font-bold ${className ?? ""}`}>
        Free
      </Badge>
    );
  }

  if (listingType === "EXCHANGE") {
    return (
      <Badge variant="indigo" className={`text-sm font-bold ${className ?? ""}`}>
        Exchange
      </Badge>
    );
  }

  // FOR_SALE
  return (
    <span className={`text-lg font-bold text-foreground ${className ?? ""}`}>
      ₹{(price ?? 0).toLocaleString("en-IN")}
    </span>
  );
}

