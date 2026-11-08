import { Badge } from "@/components/ui/badge";

type ListingStatus = "AVAILABLE" | "RESERVED" | "SOLD";
type ListingType = "FOR_SALE" | "FREE" | "EXCHANGE";

interface StatusBadgeProps {
  status: ListingStatus;
  listingType?: ListingType;
  className?: string;
}

const statusConfig: Record<ListingStatus, { label: string; variant: "success" | "warning" | "secondary" }> = {
  AVAILABLE: { label: "Available", variant: "success" },
  RESERVED: { label: "Reserved", variant: "warning" },
  SOLD: { label: "Sold", variant: "secondary" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}

