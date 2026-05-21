"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { EventItem } from "@/types/crm";

type TagInputProps = {
  tags: string[];
  events: EventItem[];
  onChange: (tags: string[]) => void;
};

export function TagInput({ tags, events, onChange }: TagInputProps) {
  const [input, setInput] = useState("");

  const suggestions = useMemo(() => {
    const allTags = Array.from(new Set(events.flatMap((event) => event.tags || [])));
    return input ? allTags.filter((tag) => tag.includes(input) && !tags.includes(tag)) : [];
  }, [events, input, tags]);

  const add = (raw: string) => {
    const value = raw.trim();
    if (!value || tags.includes(value)) return;
    onChange([...tags, value]);
    setInput("");
  };

  return (
    <div className="space-y-2">
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge key={tag} className="gap-1">
              {tag}
              <button type="button" onClick={() => onChange(tags.filter((item) => item !== tag))} aria-label={`حذف ${tag}`}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <div className="relative">
        <div className="flex gap-2">
          <Input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              add(input);
            }
          }} placeholder="تایپ کن و Enter بزن..." />
          <Button type="button" variant="outline" size="sm" onClick={() => add(input)}>افزودن</Button>
        </div>
        {suggestions.length > 0 && (
          <div className="absolute inset-x-0 top-full z-20 max-h-36 overflow-y-auto rounded-b-md border border-border bg-secondary shadow-xl">
            {suggestions.map((suggestion) => (
              <button
                type="button"
                key={suggestion}
                className="block w-full px-3 py-2 text-right text-xs hover:bg-muted"
                onClick={() => add(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground">Enter یا کاما برای افزودن تگ</p>
    </div>
  );
}
