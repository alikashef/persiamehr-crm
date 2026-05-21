import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type SearchBoxProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

export function SearchBox({ value, onChange, placeholder }: SearchBoxProps) {
  return (
    <div className="relative mb-3">
      <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="pr-9" />
    </div>
  );
}
