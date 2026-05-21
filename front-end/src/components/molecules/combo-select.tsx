"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type ComboSelectProps = {
  value?: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
};

export function ComboSelect({ value = "", onChange, options, placeholder }: ComboSelectProps) {
  const [adding, setAdding] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [allOptions, setAllOptions] = useState(options);

  useEffect(() => setAllOptions(options), [options]);

  const add = () => {
    const trimmed = newValue.trim();
    if (!trimmed) return;
    setAllOptions((previous) => [...previous, trimmed]);
    onChange(trimmed);
    setNewValue("");
    setAdding(false);
  };

  return (
    <div className="space-y-2">
      <Select value={value} onChange={(event) => {
        if (event.target.value === "__add__") setAdding(true);
        else onChange(event.target.value);
      }}>
        <option value="">{placeholder}</option>
        {allOptions.map((option) => <option key={option} value={option}>{option}</option>)}
        <option value="__add__">افزودن مورد جدید...</option>
      </Select>
      {adding && (
        <div className="flex gap-2">
          <Input autoFocus value={newValue} onChange={(event) => setNewValue(event.target.value)} onKeyDown={(event) => {
            if (event.key === "Enter") add();
          }} placeholder="تایپ کنید..." />
          <Button type="button" variant="success" size="sm" onClick={add}>
            <Plus className="h-3.5 w-3.5" />
            افزودن
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setAdding(false)}>لغو</Button>
        </div>
      )}
    </div>
  );
}
