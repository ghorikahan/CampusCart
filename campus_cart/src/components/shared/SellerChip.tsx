import { Avatar } from "@/components/ui/avatar";

interface SellerChipProps {
  name: string;
  image?: string | null;
  university?: string | null;
  city?: string | null;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function SellerChip({ name, image, university, city, className }: SellerChipProps) {
  const subtitle = university ?? city ?? null;

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <Avatar
        src={image}
        fallback={getInitials(name)}
        size="sm"
        className="h-7 w-7 shrink-0 text-[10px]"
      />
      <div className="min-w-0">
        <p className="text-xs font-medium leading-none truncate">{name}</p>
        {subtitle && (
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
