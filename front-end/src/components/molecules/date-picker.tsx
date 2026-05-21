"use client";

import { useEffect, useState } from "react";
import { Select } from "@/components/ui/select";
import { fmtSh, MONTHS, parseSh, todaySh } from "@/lib/date";

type DatePickerProps = {
  value?: string;
  onChange: (value: string) => void;
};

export function DatePicker({ value, onChange }: DatePickerProps) {
  const parsed = parseSh(value || todaySh());
  const [year, setYear] = useState(parsed.y);
  const [month, setMonth] = useState(parsed.m);
  const [day, setDay] = useState(parsed.d);

  useEffect(() => {
    if (!value) return;
    const next = parseSh(value);
    setYear(next.y);
    setMonth(next.m);
    setDay(next.d);
  }, [value]);

  const emit = (y: number, m: number, d: number) => onChange(fmtSh({ y, m, d }));
  const years = Array.from({ length: 12 }, (_, index) => 1399 + index);
  const days = Array.from({ length: 31 }, (_, index) => index + 1);

  return (
    <div className="grid grid-cols-3 gap-2">
      <Select value={String(year)} onChange={(event) => {
        const next = Number(event.target.value);
        setYear(next);
        emit(next, month, day);
      }}>
        {years.map((item) => <option key={item} value={item}>{item}</option>)}
      </Select>
      <Select value={String(month)} onChange={(event) => {
        const next = Number(event.target.value);
        setMonth(next);
        emit(year, next, day);
      }}>
        {MONTHS.map((item, index) => <option key={item} value={index + 1}>{item}</option>)}
      </Select>
      <Select value={String(day)} onChange={(event) => {
        const next = Number(event.target.value);
        setDay(next);
        emit(year, month, next);
      }}>
        {days.map((item) => <option key={item} value={item}>{item}</option>)}
      </Select>
    </div>
  );
}
